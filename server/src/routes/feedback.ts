import { Router } from 'express';
import { query, run } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { visitId, ratingNav, ratingWait, ratingEase, comments } = req.body;
    if (!ratingNav || !ratingWait || !ratingEase) {
      return res.status(400).json({ error: 'Ratings are required' });
    }

    const id = uuidv4();
    await run(`
      INSERT INTO feedback (id, visit_id, rating_nav, rating_wait, rating_ease, comments, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      visitId || 'anonymous',
      parseInt(ratingNav, 10),
      parseInt(ratingWait, 10),
      parseInt(ratingEase, 10),
      comments || null,
      new Date().toISOString()
    ]);

    res.status(201).json({ success: true, message: 'Thank you for your feedback! It helps improve hospital navigation.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedbacks = await query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50');
    res.json(feedbacks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
