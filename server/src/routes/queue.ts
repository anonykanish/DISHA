import { Router } from 'express';
import { getPatientTokenInfo, getDepartmentQueueState, generateQueueToken, requestTokenRecovery } from '../services/queueService.js';
import { query } from '../database/db.js';

const router = Router();

// Get patient token info (patients ahead, wait time, now serving)
router.get('/token/:tokenOrVisitId', async (req, res) => {
  try {
    const info = await getPatientTokenInfo(req.params.tokenOrVisitId);
    if (!info) {
      return res.status(404).json({ error: 'Token or visit queue record not found' });
    }
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get department queue status
router.get('/department/:id', async (req, res) => {
  try {
    const state = await getDepartmentQueueState(req.params.id);
    if (!state) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Join queue for a department
router.post('/join', async (req, res) => {
  try {
    const { visitId, departmentId, priority = 'standard' } = req.body;
    if (!visitId || !departmentId) {
      return res.status(400).json({ error: 'visitId and departmentId are required' });
    }

    const token = await generateQueueToken(visitId, departmentId, priority);
    res.status(201).json(token);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Request missed token recovery
router.post('/missed-recovery', async (req, res) => {
  try {
    const { tokenId, reason } = req.body;
    if (!tokenId || !reason) {
      return res.status(400).json({ error: 'tokenId and reason are required' });
    }

    const result = await requestTokenRecovery(tokenId, reason);
    res.json({ success: true, request: result, message: 'Recovery request submitted to hospital desk' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
