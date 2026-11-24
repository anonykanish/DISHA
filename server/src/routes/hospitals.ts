import { Router } from 'express';
import { query, getOne } from '../database/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hospitals = await query('SELECT * FROM hospitals ORDER BY is_demo DESC, name ASC');
    res.json(hospitals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hospital = await getOne('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
