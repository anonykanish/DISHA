import { Router } from 'express';
import { query, getOne, run } from '../database/db.js';
import { getDepartmentQueueState } from '../services/queueService.js';
import { requireStaffAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hospitalId = (req.query.hospitalId as string) || 'hosp-demo-01';
    const departments = await query('SELECT * FROM departments WHERE hospital_id = ? ORDER BY floor ASC, name ASC', [hospitalId]);

    // Attach real-time queue states
    const enhanced = await Promise.all(
      departments.map(async (dept) => {
        const state = await getDepartmentQueueState(dept.id);
        return {
          ...dept,
          queueState: state
        };
      })
    );

    res.json(enhanced);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dept = await getOne('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }
    const state = await getDepartmentQueueState(dept.id);
    res.json({ ...dept, queueState: state });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', requireStaffAuth, async (req, res) => {
  try {
    const { floor, block, room_number, average_service_time, status, open_counters, announcement, wait_threshold_low, wait_threshold_high } = req.body;
    
    await run(`
      UPDATE departments 
      SET 
        floor = COALESCE(?, floor),
        block = COALESCE(?, block),
        room_number = COALESCE(?, room_number),
        average_service_time = COALESCE(?, average_service_time),
        status = COALESCE(?, status),
        open_counters = COALESCE(?, open_counters),
        announcement = COALESCE(?, announcement),
        wait_threshold_low = COALESCE(?, wait_threshold_low),
        wait_threshold_high = COALESCE(?, wait_threshold_high)
      WHERE id = ?
    `, [
      floor,
      block,
      room_number,
      average_service_time,
      status,
      open_counters,
      announcement,
      wait_threshold_low,
      wait_threshold_high,
      req.params.id
    ]);

    const updated = await getOne('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
