import { Router } from 'express';
import { seedDatabase } from '../database/seed.js';
import { callNextPatient, completeToken, getDepartmentQueueState } from '../services/queueService.js';
import { emitTokenCalled, emitQueueUpdate, emitAnnouncement } from '../services/socketService.js';
import { getOne, query, run } from '../database/db.js';

const router = Router();

// Reset demo database to pristine hackathon state
router.post('/reset', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({
      success: true,
      message: 'Demo state reset successfully!',
      demoVisitId: 'visit-demo-judge',
      demoToken: 'OPD-024',
      accessToken: 'DISHA-DEMO-2026'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Advance queue step for demonstration
router.post('/advance-queue', async (req, res) => {
  try {
    const departmentId = (req.body.departmentId as string) || 'dept-opd';

    // 1. If there is currently a called token, complete it
    const currentCalled = await getOne<any>(
      "SELECT * FROM queue_tokens WHERE department_id = ? AND status = 'called'",
      [departmentId]
    );

    if (currentCalled) {
      await completeToken(currentCalled.id);
    }

    // 2. Call next patient in line
    const callResult = await callNextPatient(departmentId, 'Counter 2');

    const updatedState = await getDepartmentQueueState(departmentId);

    res.json({
      success: true,
      completedToken: currentCalled?.token_number || null,
      newServingToken: callResult.token?.token_number || null,
      queueState: updatedState
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger judge simulated announcement
router.post('/simulate-announcement', async (req, res) => {
  try {
    const { title = 'Queue Announcement', message = 'Token OPD-024 please proceed to Doctor Consultation Room 12' } = req.body;
    emitAnnouncement('hosp-demo-01', {
      id: `sim-ann-${Date.now()}`,
      title,
      message,
      priority: 'urgent',
      created_at: new Date().toISOString()
    });
    res.json({ success: true, message: 'Simulated announcement broadcasted!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete patient journey for demo
router.post('/complete-journey', async (req, res) => {
  try {
    const visitId = req.body.visitId || 'visit-demo-judge';
    await run("UPDATE journey_steps SET status = 'completed', completed_at = ? WHERE visit_id = ?", [new Date().toISOString(), visitId]);
    await run("UPDATE visits SET visit_status = 'completed', updated_at = ? WHERE id = ?", [new Date().toISOString(), visitId]);
    await run("UPDATE queue_tokens SET status = 'completed', completed_at = ? WHERE visit_id = ?", [new Date().toISOString(), visitId]);

    res.json({ success: true, message: 'Demo patient visit marked as fully completed!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
