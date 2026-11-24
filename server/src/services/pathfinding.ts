import { query } from '../database/db.js';

export interface MapNode {
  id: string;
  hospital_id: string;
  floor: number;
  name: string;
  node_type: string;
  x: number;
  y: number;
  is_accessible: number;
  description: string;
}

export interface MapEdge {
  id: string;
  hospital_id: string;
  source_node: string;
  destination_node: string;
  distance: number;
  wheelchair_accessible: number;
  direction_hint: string;
}

export interface NavigationStep {
  stepNumber: number;
  fromNode: MapNode;
  toNode: MapNode;
  instruction: string;
  distanceMeters: number;
  floorChange: boolean;
  fromFloor: number;
  toFloor: number;
  isWheelchairAccessible: boolean;
}

export interface RouteResult {
  path: MapNode[];
  steps: NavigationStep[];
  totalDistanceMeters: number;
  estimatedWalkTimeMinutes: number;
  wheelchairAccessible: boolean;
  floorsCovered: number[];
}

export async function calculateShortestPath(
  hospitalId: string,
  startNodeId: string,
  destNodeId: string,
  wheelchairOnly = false
): Promise<RouteResult | null> {
  // Fetch all nodes and edges for the hospital
  const nodes = await query<MapNode>(
    'SELECT * FROM map_nodes WHERE hospital_id = ?',
    [hospitalId]
  );
  const edges = await query<MapEdge>(
    'SELECT * FROM map_edges WHERE hospital_id = ?',
    [hospitalId]
  );

  const nodeMap = new Map<string, MapNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  if (!nodeMap.has(startNodeId) || !nodeMap.has(destNodeId)) {
    return null;
  }

  // Filter edges if wheelchairOnly is active
  const adj = new Map<string, { target: string; dist: number; edge: MapEdge }[]>();
  for (const n of nodes) {
    adj.set(n.id, []);
  }

  for (const edge of edges) {
    if (wheelchairOnly && edge.wheelchair_accessible === 0) {
      continue; // Skip stairs or steep routes
    }
    const list = adj.get(edge.source_node);
    if (list) {
      list.push({ target: edge.destination_node, dist: edge.distance, edge });
    }
  }

  // Dijkstra's Algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, { prevNode: string; edge: MapEdge }>();
  const unvisited = new Set<string>();

  for (const n of nodes) {
    distances.set(n.id, Infinity);
    unvisited.add(n.id);
  }
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find min distance unvisited node
    let current: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const d = distances.get(nodeId)!;
      if (d < minDistance) {
        minDistance = d;
        current = nodeId;
      }
    }

    if (current === null || minDistance === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (current === destNodeId) {
      break; // Reached destination
    }

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.target)) continue;

      const alt = distances.get(current)! + neighbor.dist;
      if (alt < distances.get(neighbor.target)!) {
        distances.set(neighbor.target, alt);
        previous.set(neighbor.target, { prevNode: current, edge: neighbor.edge });
      }
    }
  }

  if (distances.get(destNodeId) === Infinity) {
    return null; // No route found
  }

  // Reconstruct path
  const path: MapNode[] = [];
  const edgeSequence: MapEdge[] = [];
  let curr = destNodeId;

  while (curr !== startNodeId) {
    const node = nodeMap.get(curr)!;
    path.unshift(node);
    const prevInfo = previous.get(curr);
    if (!prevInfo) break;
    edgeSequence.unshift(prevInfo.edge);
    curr = prevInfo.prevNode;
  }
  path.unshift(nodeMap.get(startNodeId)!);

  // Generate turn-by-turn navigation steps
  const steps: NavigationStep[] = [];
  let totalDistanceUnits = 0;
  const floors = new Set<number>();

  for (let i = 0; i < edgeSequence.length; i++) {
    const fromNode = path[i];
    const toNode = path[i + 1];
    const edge = edgeSequence[i];
    const floorChange = fromNode.floor !== toNode.floor;

    floors.add(fromNode.floor);
    floors.add(toNode.floor);
    totalDistanceUnits += edge.distance;

    let instruction = edge.direction_hint || `Move from ${fromNode.name} to ${toNode.name}`;
    if (floorChange) {
      const floorName = toNode.floor === 0 ? 'Ground Floor' : toNode.floor === 1 ? 'First Floor' : 'Second Floor';
      instruction = `Take ${toNode.node_type === 'elevator' ? 'Elevator' : 'Stairs'} up to ${floorName}`;
    }

    // Convert pixel distance to estimated meters (1 unit ~ 0.25 meters)
    const distanceMeters = Math.max(5, Math.round(edge.distance * 0.25));

    steps.push({
      stepNumber: i + 1,
      fromNode,
      toNode,
      instruction,
      distanceMeters,
      floorChange,
      fromFloor: fromNode.floor,
      toFloor: toNode.floor,
      isWheelchairAccessible: edge.wheelchair_accessible === 1
    });
  }

  // Total distance in meters
  const totalDistanceMeters = steps.reduce((sum, s) => sum + s.distanceMeters, 0);
  // Average hospital walking pace: ~45-50 meters per minute for patients
  const estimatedWalkTimeMinutes = Math.max(1, Math.round(totalDistanceMeters / 45));

  return {
    path,
    steps,
    totalDistanceMeters,
    estimatedWalkTimeMinutes,
    wheelchairAccessible: wheelchairOnly,
    floorsCovered: Array.from(floors)
  };
}
