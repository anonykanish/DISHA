import { Router } from 'express';
import { query, getOne, run } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate temporary Caregiver Connect share link
router.post('/share', async (req, res) => {
  try {
    const { visitId } = req.body;
    if (!visitId) {
      return res.status(400).json({ error: 'visitId is required' });
    }

    const visit = await getOne('SELECT * FROM visits WHERE id = ?', [visitId]);
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const shareToken = `cg-${uuidv4().substring(0, 8)}`;
    // Expires in 12 hours
    const expiresAt = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
    const linkId = uuidv4();

    await run(`
      INSERT INTO caregiver_links (id, visit_id, share_token, expires_at, revoked, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `, [linkId, visitId, shareToken, expiresAt, new Date().toISOString()]);

    res.status(201).json({
      linkId,
      shareToken,
      expiresAt,
      shareUrl: `/caregiver/${shareToken}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Caregiver read-only view (SAFE: NO medical diagnosis or sensitive clinical records)
router.get('/view/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    const link = await getOne<any>(
      'SELECT * FROM caregiver_links WHERE share_token = ? AND revoked = 0',
      [shareToken]
    );

    if (!link) {
      return res.status(404).json({ error: 'Caregiver link is invalid or has been revoked by the patient.' });
    }

    if (new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Caregiver link has expired.' });
    }

    const visit = await getOne<any>('SELECT id, hospital_id, purpose, visit_status, created_at FROM visits WHERE id = ?', [link.visit_id]);
    const hospital = await getOne('SELECT name, address, emergency_contact FROM hospitals WHERE id = ?', [visit.hospital_id]);

    // Active tokens (tokens & queue status only)
    const tokens = await query(`
      SELECT qt.token_number, qt.status, qt.called_at, qt.counter_number, d.name as department_name, d.floor, d.block, d.room_number
      FROM queue_tokens qt
      JOIN departments d ON qt.department_id = d.id
      WHERE qt.visit_id = ?
      ORDER BY qt.created_at DESC
    `, [link.visit_id]);

    // Journey progress
    const steps = await query(`
      SELECT js.step_order, js.status, d.name as department_name, d.floor, d.block
      FROM journey_steps js
      JOIN departments d ON js.department_id = d.id
      WHERE js.visit_id = ?
      ORDER BY js.step_order ASC
    `, [link.visit_id]);

    res.json({
      visitId: visit.id,
      hospital,
      purpose: visit.purpose,
      visitStatus: visit.visit_status,
      startedAt: visit.created_at,
      tokens,
      steps,
      activeToken: tokens.find((t: any) => t.status === 'called' || t.status === 'waiting' || t.status === 'approaching') || tokens[0] || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke Caregiver link
router.delete('/revoke/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    await run('UPDATE caregiver_links SET revoked = 1 WHERE id = ?', [linkId]);
    res.json({ success: true, message: 'Caregiver access revoked successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
