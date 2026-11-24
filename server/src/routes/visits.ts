import { Router } from 'express';
import { query, getOne, run } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { generateQueueToken, getDepartmentQueueState } from '../services/queueService.js';
import { emitJourneyUpdate } from '../services/socketService.js';

const router = Router();

// Create new visit
router.post('/', async (req, res) => {
  try {
    const {
      hospitalId = 'hosp-demo-01',
      purpose = 'General OPD',
      language = 'en',
      patientName,
      patientPhone,
      patientAge,
      patientGender
    } = req.body;

    const visitId = `visit-${uuidv4().substring(0, 8)}`;
    // Secure unguessable access credential
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accessToken = `DSH-${randomSuffix}`;
    const now = new Date().toISOString();

    await run(`
      INSERT INTO visits 
      (id, access_token, hospital_id, purpose, language, patient_name, patient_phone, patient_age, patient_gender, visit_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?)
    `, [
      visitId,
      accessToken,
      hospitalId,
      purpose,
      language,
      patientName || 'Guest Patient',
      patientPhone || null,
      patientAge ? parseInt(patientAge, 10) : null,
      patientGender || null,
      now,
      now
    ]);

    // Construct tailored journey based on purpose
    let journeyDeptIds: string[] = [];
    let initialTokenDeptId = 'dept-opd';

    if (purpose.includes('Laboratory') || purpose.includes('Blood')) {
      journeyDeptIds = ['dept-reg', 'dept-bld', 'dept-lab', 'dept-flw'];
      initialTokenDeptId = 'dept-bld';
    } else if (purpose.includes('Pharmacy')) {
      journeyDeptIds = ['dept-pha'];
      initialTokenDeptId = 'dept-pha';
    } else if (purpose.includes('Follow-up')) {
      journeyDeptIds = ['dept-flw', 'dept-opd', 'dept-pha'];
      initialTokenDeptId = 'dept-flw';
    } else if (purpose.includes('Hospital assistance')) {
      journeyDeptIds = ['dept-hlp', 'dept-reg', 'dept-opd'];
      initialTokenDeptId = 'dept-hlp';
    } else {
      // Default: General OPD
      journeyDeptIds = ['dept-reg', 'dept-opd', 'dept-pha'];
      initialTokenDeptId = 'dept-opd';
    }

    // Insert Journey Steps
    for (let i = 0; i < journeyDeptIds.length; i++) {
      const stepId = uuidv4();
      const status = i === 0 ? 'in_progress' : 'pending';
      await run(`
        INSERT INTO journey_steps (id, visit_id, department_id, step_order, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [stepId, visitId, journeyDeptIds[i], i + 1, status, now]);
    }

    // Generate initial Queue Token for the first active medical department
    const token = await generateQueueToken(visitId, initialTokenDeptId);

    // Generate QR Code for Visit Access Token
    const qrPayload = JSON.stringify({
      dishaVisitId: visitId,
      accessToken,
      hospitalId,
      purpose
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 250, margin: 1 });

    const visit = await getOne('SELECT * FROM visits WHERE id = ?', [visitId]);

    res.status(201).json({
      visit,
      accessToken,
      qrCode: qrDataUrl,
      initialToken: token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get visit details by ID or access_token
router.get('/:tokenOrId', async (req, res) => {
  try {
    const { tokenOrId } = req.params;

    const visit = await getOne(
      'SELECT * FROM visits WHERE id = ? OR access_token = ?',
      [tokenOrId, tokenOrId]
    );

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Fetch hospital
    const hospital = await getOne('SELECT * FROM hospitals WHERE id = ?', [visit.hospital_id]);

    // Fetch journey steps with department details
    const steps = await query(`
      SELECT js.*, d.name as department_name, d.code as department_code, d.floor, d.block, d.room_number, d.average_service_time
      FROM journey_steps js
      JOIN departments d ON js.department_id = d.id
      WHERE js.visit_id = ?
      ORDER BY js.step_order ASC
    `, [visit.id]);

    // Fetch all queue tokens for this visit
    const tokens = await query(`
      SELECT qt.*, d.name as department_name, d.code as department_code, d.floor, d.block, d.room_number
      FROM queue_tokens qt
      JOIN departments d ON qt.department_id = d.id
      WHERE qt.visit_id = ?
      ORDER BY qt.created_at DESC
    `, [visit.id]);

    // Generate QR Data URL
    const qrPayload = JSON.stringify({
      dishaVisitId: visit.id,
      accessToken: visit.access_token,
      hospitalId: visit.hospital_id
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 250, margin: 1 });

    res.json({
      visit,
      hospital,
      steps,
      tokens,
      activeToken: tokens.find((t: any) => t.status === 'called' || t.status === 'waiting' || t.status === 'approaching') || tokens[0] || null,
      qrCode: qrDataUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update journey steps (add/remove/reorder)
router.post('/:id/journey', async (req, res) => {
  try {
    const { departmentId, action, stepId } = req.body;
    const visitId = req.params.id;

    if (action === 'add' && departmentId) {
      const highestOrder = await getOne<any>(
        'SELECT MAX(step_order) as maxOrder FROM journey_steps WHERE visit_id = ?',
        [visitId]
      );
      const nextOrder = (highestOrder?.maxOrder || 0) + 1;
      const newStepId = uuidv4();
      await run(`
        INSERT INTO journey_steps (id, visit_id, department_id, step_order, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `, [newStepId, visitId, departmentId, nextOrder, new Date().toISOString()]);
    } else if (action === 'remove' && stepId) {
      await run('DELETE FROM journey_steps WHERE id = ? AND visit_id = ?', [stepId, visitId]);
    } else if (action === 'complete' && stepId) {
      await run(
        "UPDATE journey_steps SET status = 'completed', completed_at = ? WHERE id = ? AND visit_id = ?",
        [new Date().toISOString(), stepId, visitId]
      );
    }

    const updatedSteps = await query(`
      SELECT js.*, d.name as department_name, d.code as department_code, d.floor, d.block, d.room_number
      FROM journey_steps js
      JOIN departments d ON js.department_id = d.id
      WHERE js.visit_id = ?
      ORDER BY js.step_order ASC
    `, [visitId]);

    emitJourneyUpdate(visitId, updatedSteps);

    res.json(updatedSteps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
