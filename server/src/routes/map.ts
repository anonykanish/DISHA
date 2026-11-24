import { Router } from 'express';
import { query } from '../database/db.js';
import QRCode from 'qrcode';

const router = Router();

router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const nodes = await query('SELECT * FROM map_nodes WHERE hospital_id = ? ORDER BY floor ASC, name ASC', [hospitalId]);
    const edges = await query('SELECT * FROM map_edges WHERE hospital_id = ?', [hospitalId]);

    res.json({
      hospitalId,
      nodes,
      edges,
      floors: [
        { floor: 0, name: 'Ground Floor', shortName: 'G' },
        { floor: 1, name: 'First Floor', shortName: '1F' },
        { floor: 2, name: 'Second Floor', shortName: '2F' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Checkpoints for QR scanning and printables
router.get('/checkpoints/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const nodes = await query(
      "SELECT * FROM map_nodes WHERE hospital_id = ? AND node_type IN ('entrance', 'junction', 'counter', 'department', 'elevator', 'helpdesk', 'waiting') ORDER BY floor ASC, name ASC",
      [hospitalId]
    );

    // Generate QR payload for each checkpoint
    const checkpointsWithQR = await Promise.all(
      nodes.map(async (n) => {
        const qrPayload = JSON.stringify({
          dishaHospitalId: hospitalId,
          checkpointId: n.id,
          checkpointName: n.name,
          floor: n.floor
        });
        const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });
        return {
          ...n,
          qrPayload,
          qrDataUrl
        };
      })
    );

    res.json(checkpointsWithQR);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
