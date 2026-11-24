import React, { useState } from 'react';
import { MapNode, RouteResult } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Navigation, Info } from 'lucide-react';

interface HospitalMapSvgProps {
  currentFloor: number;
  nodes: MapNode[];
  selectedStartNodeId?: string;
  selectedDestNodeId?: string;
  routeResult?: RouteResult | null;
  currentStepIndex?: number;
  onSelectNode?: (node: MapNode) => void;
}

export const HospitalMapSvg: React.FC<HospitalMapSvgProps> = ({
  currentFloor,
  nodes,
  selectedStartNodeId,
  selectedDestNodeId,
  routeResult,
  currentStepIndex = 0,
  onSelectNode
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  const floorNodes = nodes.filter(n => n.floor === currentFloor);

  // Extract path nodes that belong to this floor
  const floorPathNodes: MapNode[] = [];
  if (routeResult && routeResult.path) {
    for (const node of routeResult.path) {
      if (node.floor === currentFloor) {
        floorPathNodes.push(node);
      }
    }
  }

  // Build SVG path string for route on this floor
  let routePathData = '';
  if (floorPathNodes.length >= 2) {
    routePathData = `M ${floorPathNodes[0].x} ${floorPathNodes[0].y}`;
    for (let i = 1; i < floorPathNodes.length; i++) {
      routePathData += ` L ${floorPathNodes[i].x} ${floorPathNodes[i].y}`;
    }
  }

  // Active step node
  const activeStep = routeResult?.steps[currentStepIndex];
  const activeStepNode = activeStep?.toNode.floor === currentFloor ? activeStep.toNode : null;

  return (
    <div className="relative w-full h-[450px] md:h-[550px] bg-slate-100 dark:bg-[#142329] rounded-card border border-gray-200 dark:border-gray-800 overflow-hidden shadow-inner flex flex-col">
      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 dark:bg-disha-darkCard/95 p-1 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floor & Demonstration Badge */}
      <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-disha-darkCard/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-xs">
        <span className="font-bold text-disha-lightPrimary dark:text-disha-darkPrimary">
          {currentFloor === 0 ? 'Ground Floor' : currentFloor === 1 ? 'First Floor (1F)' : 'Second Floor (2F)'}
        </span>
        <span className="text-gray-400 dark:text-gray-500 mx-1.5">|</span>
        <span className="text-gray-600 dark:text-gray-300">Tap room/node to navigate</span>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center">
        <svg
          viewBox="100 100 650 480"
          className="w-full h-full select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Gradients and Filters */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#087F70" />
              <stop offset="100%" stopColor="#5CD6BD" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#087F70" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Hospital Building Perimeter Walls */}
          <rect
            x="140"
            y="130"
            width="560"
            height="430"
            rx="24"
            className="fill-white dark:fill-[#1b2a30] stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="3"
          />

          {/* Corridors Grid */}
          <rect x="330" y="160" width="140" height="370" className="fill-slate-50 dark:fill-[#20333b]" />
          <rect x="170" y="380" width="460" height="90" className="fill-slate-50 dark:fill-[#20333b]" />

          {/* Department Rooms Layout Based on Floor */}
          {currentFloor === 0 && (
            <g className="ground-floor-rooms">
              {/* Registration */}
              <rect x="170" y="400" width="160" height="80" rx="10" className="fill-teal-50 dark:fill-teal-950/40 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
              <text x="250" y="435" textAnchor="middle" className="text-[12px] font-bold fill-teal-900 dark:fill-teal-200">Registration Desk</text>
              <text x="250" y="455" textAnchor="middle" className="text-[10px] fill-teal-600 dark:fill-teal-400">Counters 1 - 4 (Room G-01)</text>

              {/* General OPD */}
              <rect x="160" y="160" width="150" height="130" rx="12" className="fill-blue-50 dark:fill-blue-950/40 stroke-blue-200 dark:stroke-blue-800" strokeWidth="2" />
              <text x="235" y="220" textAnchor="middle" className="text-[13px] font-bold fill-blue-900 dark:fill-blue-200">General OPD</text>
              <text x="235" y="240" textAnchor="middle" className="text-[11px] fill-blue-600 dark:fill-blue-400">Consultation G-12</text>

              {/* Emergency */}
              <rect x="530" y="160" width="150" height="130" rx="12" className="fill-red-50 dark:fill-red-950/40 stroke-red-300 dark:stroke-red-800" strokeWidth="2" />
              <text x="605" y="220" textAnchor="middle" className="text-[13px] font-bold fill-red-800 dark:fill-red-300">Emergency (Casualty)</text>
              <text x="605" y="240" textAnchor="middle" className="text-[11px] fill-red-600 dark:fill-red-400">Room G-EM | 24x7</text>

              {/* Pharmacy */}
              <rect x="520" y="400" width="160" height="80" rx="10" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="2" />
              <text x="600" y="435" textAnchor="middle" className="text-[13px] font-bold fill-emerald-900 dark:fill-emerald-200">Pharmacy (Jan Aushadhi)</text>
              <text x="600" y="455" textAnchor="middle" className="text-[10px] fill-emerald-600 dark:fill-emerald-400">Free Medicine (Room G-08)</text>

              {/* Help Desk Central */}
              <circle cx="490" cy="440" r="28" className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-300 dark:stroke-amber-700" strokeWidth="2" />
              <text x="490" y="443" textAnchor="middle" className="text-[10px] font-bold fill-amber-900 dark:fill-amber-200">Help Desk</text>

              {/* Main Entrance */}
              <rect x="360" y="530" width="80" height="30" rx="6" className="fill-teal-700 stroke-teal-900" />
              <text x="400" y="550" textAnchor="middle" className="text-[11px] font-bold fill-white">ENTRANCE</text>
            </g>
          )}

          {currentFloor === 1 && (
            <g className="first-floor-rooms">
              {/* Pathology Lab */}
              <rect x="160" y="160" width="150" height="90" rx="10" className="fill-indigo-50 dark:fill-indigo-950/40 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />
              <text x="235" y="200" textAnchor="middle" className="text-[13px] font-bold fill-indigo-900 dark:fill-indigo-200">Pathology Lab</text>
              <text x="235" y="220" textAnchor="middle" className="text-[10px] fill-indigo-600 dark:fill-indigo-400">Room 1-05</text>

              {/* Blood Sample */}
              <rect x="160" y="270" width="150" height="90" rx="10" className="fill-rose-50 dark:fill-rose-950/40 stroke-rose-200 dark:stroke-rose-800" strokeWidth="2" />
              <text x="235" y="310" textAnchor="middle" className="text-[13px] font-bold fill-rose-900 dark:fill-rose-200">Blood Collection</text>
              <text x="235" y="330" textAnchor="middle" className="text-[10px] fill-rose-600 dark:fill-rose-400">Phlebotomy 1-06</text>

              {/* Radiology */}
              <rect x="530" y="160" width="150" height="90" rx="10" className="fill-cyan-50 dark:fill-cyan-950/40 stroke-cyan-200 dark:stroke-cyan-800" strokeWidth="2" />
              <text x="605" y="200" textAnchor="middle" className="text-[13px] font-bold fill-cyan-900 dark:fill-cyan-200">Radiology (USG/CT)</text>
              <text x="605" y="220" textAnchor="middle" className="text-[10px] fill-cyan-600 dark:fill-cyan-400">Desk 1-14</text>

              {/* X-Ray */}
              <rect x="530" y="270" width="150" height="90" rx="10" className="fill-violet-50 dark:fill-violet-950/40 stroke-violet-200 dark:stroke-violet-800" strokeWidth="2" />
              <text x="605" y="310" textAnchor="middle" className="text-[13px] font-bold fill-violet-900 dark:fill-violet-200">X-Ray Department</text>
              <text x="605" y="330" textAnchor="middle" className="text-[10px] fill-violet-600 dark:fill-violet-400">Room 1-16</text>

              {/* Waiting Lounge */}
              <rect x="330" y="400" width="140" height="80" rx="10" className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-200 dark:stroke-emerald-800" strokeWidth="2" />
              <text x="400" y="440" textAnchor="middle" className="text-[12px] font-bold fill-emerald-900 dark:fill-emerald-200">Waiting Lounge</text>
              <text x="400" y="458" textAnchor="middle" className="text-[10px] fill-emerald-600 dark:fill-emerald-400">Report Collection</text>
            </g>
          )}

          {currentFloor === 2 && (
            <g className="second-floor-rooms">
              {/* Specialist OPD */}
              <rect x="160" y="160" width="150" height="90" rx="10" className="fill-purple-50 dark:fill-purple-950/40 stroke-purple-200 dark:stroke-purple-800" strokeWidth="2" />
              <text x="235" y="200" textAnchor="middle" className="text-[13px] font-bold fill-purple-900 dark:fill-purple-200">Specialist OPD</text>
              <text x="235" y="220" textAnchor="middle" className="text-[10px] fill-purple-600 dark:fill-purple-400">Clinic 2-01</text>

              {/* Orthopaedics */}
              <rect x="160" y="270" width="150" height="90" rx="10" className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-200 dark:stroke-amber-800" strokeWidth="2" />
              <text x="235" y="310" textAnchor="middle" className="text-[13px] font-bold fill-amber-900 dark:fill-amber-200">Orthopaedics</text>
              <text x="235" y="330" textAnchor="middle" className="text-[10px] fill-amber-600 dark:fill-amber-400">Bones & Joints 2-08</text>

              {/* Cardiology */}
              <rect x="530" y="160" width="150" height="90" rx="10" className="fill-rose-50 dark:fill-rose-950/40 stroke-rose-200 dark:stroke-rose-800" strokeWidth="2" />
              <text x="605" y="200" textAnchor="middle" className="text-[13px] font-bold fill-rose-900 dark:fill-rose-200">Cardiology & ECG</text>
              <text x="605" y="220" textAnchor="middle" className="text-[10px] fill-rose-600 dark:fill-rose-400">Heart Clinic 2-15</text>

              {/* ENT */}
              <rect x="530" y="270" width="150" height="90" rx="10" className="fill-sky-50 dark:fill-sky-950/40 stroke-sky-200 dark:stroke-sky-800" strokeWidth="2" />
              <text x="605" y="310" textAnchor="middle" className="text-[13px] font-bold fill-sky-900 dark:fill-sky-200">ENT Clinic</text>
              <text x="605" y="330" textAnchor="middle" className="text-[10px] fill-sky-600 dark:fill-sky-400">Room 2-20</text>

              {/* Follow-up Counter */}
              <rect x="330" y="400" width="140" height="80" rx="10" className="fill-teal-50 dark:fill-teal-950/40 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
              <text x="400" y="440" textAnchor="middle" className="text-[12px] font-bold fill-teal-900 dark:fill-teal-200">Follow-up Counter</text>
              <text x="400" y="458" textAnchor="middle" className="text-[10px] fill-teal-600 dark:fill-teal-400">Room 2-00</text>
            </g>
          )}

          {/* Elevator Lift & Stairs Shaft (All Floors) */}
          <g className="vertical-transit">
            {/* Elevator Lift A (Wheelchair friendly) */}
            <rect x="330" y="170" width="60" height="55" rx="8" className="fill-teal-600 dark:fill-teal-500 stroke-teal-800" strokeWidth="2" />
            <text x="360" y="196" textAnchor="middle" className="text-[11px] font-bold fill-white">LIFT A</text>
            <text x="360" y="212" textAnchor="middle" className="text-[9px] fill-white opacity-90">♿ Accessible</text>

            {/* Staircase A (Stairs only) */}
            <rect x="410" y="170" width="60" height="55" rx="8" className="fill-slate-300 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-600" strokeWidth="2" />
            <text x="440" y="196" textAnchor="middle" className="text-[11px] font-bold fill-slate-800 dark:fill-slate-200">STAIRS</text>
            <text x="440" y="212" textAnchor="middle" className="text-[8px] fill-slate-600 dark:fill-slate-400">No Wheelchair</text>
          </g>

          {/* CALCULATED ROUTE PATH LINE (Animated) */}
          {routePathData && (
            <g className="route-layer">
              {/* Route shadow/border */}
              <path
                d={routePathData}
                fill="none"
                stroke="#087F70"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
              />
              {/* Route glowing dashed stroke */}
              <path
                d={routePathData}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
                className="animate-pulse"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* Map Nodes (Interactive Markers) */}
          {floorNodes.map((node) => {
            const isStart = node.id === selectedStartNodeId;
            const isDest = node.id === selectedDestNodeId;
            const isRouteWaypoint = floorPathNodes.some(n => n.id === node.id);
            const isActiveStep = activeStepNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode && onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
              >
                {/* Node Outer Ring */}
                {isActiveStep && (
                  <circle r="18" className="fill-teal-400/30 animate-ping" />
                )}

                {isStart ? (
                  // Current location marker (Blue ping)
                  <g>
                    <circle r="14" className="fill-blue-500/30 animate-pulse" />
                    <circle r="8" className="fill-blue-600 stroke-white stroke-2" />
                    <circle r="3" className="fill-white" />
                  </g>
                ) : isDest ? (
                  // Destination marker (Teal star/pin)
                  <g>
                    <circle r="14" className="fill-red-500/30 animate-pulse" />
                    <circle r="9" className="fill-red-600 stroke-white stroke-2" />
                    <circle r="3" className="fill-white" />
                  </g>
                ) : isRouteWaypoint ? (
                  // Route node waypoint
                  <circle r="6" className="fill-disha-lightPrimary dark:fill-disha-darkPrimary stroke-white stroke-2" />
                ) : (
                  // Regular ambient node
                  <circle
                    r="4"
                    className="fill-slate-400 dark:fill-slate-500 hover:fill-teal-600 transition"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered / Selected Node Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 bg-white/95 dark:bg-disha-darkCard/95 p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
          <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            {hoveredNode.name}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{hoveredNode.description}</p>
        </div>
      )}
    </div>
  );
};
