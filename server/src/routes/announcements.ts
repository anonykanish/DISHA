import { Router } from 'express';
import { query, run } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { emitAnnouncement } from '../services/socketService.js';
import { requireStaffAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hospitalId = (req.query.hospitalId as string) || 'hosp-demo-01';
    const announcements = await query(`
      SELECT a.*, d.name as department_name 
      FROM announcements a
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.hospital_id = ?
      ORDER BY a.created_at DESC LIMIT 20
    `, [hospitalId]);
    res.json(announcements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireStaffAuth, async (req, res) => {
  try {
    const { hospitalId = 'hosp-demo-01', departmentId, title, message, priority = 'normal' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await run(`
      INSERT INTO announcements (id, hospital_id, department_id, title, message, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, hospitalId, departmentId || null, title, message, priority, now]);

    const announcement = { id, hospitalId, departmentId, title, message, priority, created_at: now };
    emitAnnouncement(hospitalId, announcement);

    res.status(201).json(announcement);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
