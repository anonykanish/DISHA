import { Router } from 'express';
import { calculateShortestPath } from '../services/pathfinding.js';

const router = Router();

router.post('/route', async (req, res) => {
  try {
    const { hospitalId = 'hosp-demo-01', startNodeId, destinationNodeId, wheelchairAccessible = false } = req.body;

    if (!startNodeId || !destinationNodeId) {
      return res.status(400).json({ error: 'startNodeId and destinationNodeId are required' });
    }

    const route = await calculateShortestPath(
      hospitalId,
      startNodeId,
      destinationNodeId,
      Boolean(wheelchairAccessible)
    );

    if (!route) {
      return res.status(404).json({ error: 'No accessible route found between selected points' });
    }

    res.json(route);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
