import { query, getOne, run, exec } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { emitQueueUpdate, emitTokenCalled, emitJourneyUpdate } from './socketService.js';

export interface QueueState {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  floor: number;
  block: string;
  roomNumber: string;
  status: string; // 'open', 'paused', 'closed'
  openCounters: number;
  averageServiceTime: number;
  nowServingToken: string | null;
  nowServingCounter: string | null;
  totalWaiting: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  estimatedWaitMinutes: number;
  announcement?: string;
}

export async function getDepartmentQueueState(departmentId: string): Promise<QueueState | null> {
  const dept = await getOne<any>('SELECT * FROM departments WHERE id = ?', [departmentId]);
  if (!dept) return null;

  // Active called token
  const calledToken = await getOne<any>(
    "SELECT * FROM queue_tokens WHERE department_id = ? AND status = 'called' ORDER BY called_at DESC LIMIT 1",
    [departmentId]
  );

  // Waiting count
  const waitingTokens = await query<any>(
    "SELECT COUNT(*) as cnt FROM queue_tokens WHERE department_id = ? AND status IN ('waiting', 'approaching')",
    [departmentId]
  );
  const totalWaiting = waitingTokens[0]?.cnt || 0;

  // Crowd level determination
  let crowdLevel: 'low' | 'moderate' | 'high' = 'low';
  if (totalWaiting > (dept.wait_threshold_high || 15)) {
    crowdLevel = 'high';
  } else if (totalWaiting > (dept.wait_threshold_low || 5)) {
    crowdLevel = 'moderate';
  }

  // Estimated wait time
  const openCounters = Math.max(1, dept.open_counters || 1);
  const avgTime = Math.max(2, dept.average_service_time || 8);
  const estimatedWaitMinutes = Math.round((totalWaiting * avgTime) / openCounters);

  return {
    departmentId: dept.id,
    departmentName: dept.name,
    departmentCode: dept.code,
    floor: dept.floor,
    block: dept.block,
    roomNumber: dept.room_number,
    status: dept.status,
    openCounters,
    averageServiceTime: avgTime,
    nowServingToken: calledToken ? calledToken.token_number : null,
    nowServingCounter: calledToken ? (calledToken.counter_number || 'Counter 1') : null,
    totalWaiting,
    crowdLevel,
    estimatedWaitMinutes,
    announcement: dept.announcement
  };
}

export async function getPatientTokenInfo(visitIdOrToken: string, departmentId?: string) {
  let token = null;

  if (departmentId) {
    token = await getOne<any>(
      'SELECT * FROM queue_tokens WHERE visit_id = ? AND department_id = ? ORDER BY created_at DESC LIMIT 1',
      [visitIdOrToken, departmentId]
    );
  } else {
    // Find most relevant active token
    token = await getOne<any>(
      "SELECT * FROM queue_tokens WHERE (visit_id = ? OR token_number = ?) AND status IN ('waiting', 'approaching', 'called') ORDER BY created_at DESC LIMIT 1",
      [visitIdOrToken, visitIdOrToken]
    );

    if (!token) {
      // Find latest token regardless of status
      token = await getOne<any>(
        'SELECT * FROM queue_tokens WHERE visit_id = ? OR token_number = ? ORDER BY created_at DESC LIMIT 1',
        [visitIdOrToken, visitIdOrToken]
      );
    }
  }

  if (!token) return null;

  const deptState = await getDepartmentQueueState(token.department_id);
  if (!deptState) return null;

  // Calculate patients ahead
  let patientsAhead = 0;
  if (token.status === 'waiting' || token.status === 'approaching') {
    const aheadResult = await query<any>(
      `SELECT COUNT(*) as cnt FROM queue_tokens 
       WHERE department_id = ? 
       AND status IN ('waiting', 'approaching') 
       AND created_at < ?`,
      [token.department_id, token.created_at]
    );
    patientsAhead = aheadResult[0]?.cnt || 0;
  }

  const estimatedWaitMinutes = Math.max(0, Math.round((patientsAhead * deptState.averageServiceTime) / deptState.openCounters));

  return {
    token,
    department: deptState,
    patientsAhead,
    estimatedWaitMinutes,
    nowServing: deptState.nowServingToken,
    nowServingCounter: deptState.nowServingCounter
  };
}

export async function generateQueueToken(
  visitId: string,
  departmentId: string,
  priority: string = 'standard'
): Promise<any> {
  const dept = await getOne<any>('SELECT * FROM departments WHERE id = ?', [departmentId]);
  if (!dept) throw new Error('Department not found');

  // Count existing tokens for today or total in this dept
  const countRow = await getOne<any>(
    'SELECT COUNT(*) as cnt FROM queue_tokens WHERE department_id = ?',
    [departmentId]
  );
  const nextNum = (countRow?.cnt || 0) + 1;
  const tokenNumber = `${dept.code}-${String(nextNum).padStart(3, '0')}`;

  const tokenId = uuidv4();
  const now = new Date().toISOString();

  await run(`
    INSERT INTO queue_tokens 
    (id, visit_id, department_id, token_number, status, priority, created_at)
    VALUES (?, ?, ?, ?, 'waiting', ?, ?)
  `, [tokenId, visitId, departmentId, tokenNumber, priority, now]);

  const createdToken = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [tokenId]);

  // Broadcast queue update
  const updatedState = await getDepartmentQueueState(departmentId);
  if (updatedState) {
    emitQueueUpdate(departmentId, updatedState);
  }

  return createdToken;
}

export async function callNextPatient(
  departmentId: string,
  counterNumber: string = 'Counter 1'
): Promise<any> {
  // Find next waiting token
  const nextToken = await getOne<any>(
    `SELECT * FROM queue_tokens 
     WHERE department_id = ? AND status = 'waiting'
     ORDER BY 
       CASE priority 
         WHEN 'urgent' THEN 1 
         WHEN 'wheelchair' THEN 2 
         WHEN 'elderly' THEN 3 
         ELSE 4 
       END ASC, 
       created_at ASC 
     LIMIT 1`,
    [departmentId]
  );

  if (!nextToken) {
    return { success: false, message: 'No waiting patients in queue' };
  }

  const now = new Date().toISOString();

  // Mark token as called
  await run(`
    UPDATE queue_tokens 
    SET status = 'called', called_at = ?, counter_number = ? 
    WHERE id = ?
  `, [now, counterNumber, nextToken.id]);

  // Update approaching status for the next 2 in line
  await run(`
    UPDATE queue_tokens 
    SET status = 'approaching' 
    WHERE id IN (
      SELECT id FROM queue_tokens 
      WHERE department_id = ? AND status = 'waiting' 
      ORDER BY created_at ASC LIMIT 2
    )
  `, [departmentId]);

  const updatedToken = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [nextToken.id]);

  // Emit real-time events
  emitTokenCalled(nextToken.visit_id, departmentId, {
    tokenId: nextToken.id,
    tokenNumber: nextToken.token_number,
    departmentId,
    counterNumber,
    visitId: nextToken.visit_id,
    calledAt: now
  });

  const updatedState = await getDepartmentQueueState(departmentId);
  if (updatedState) {
    emitQueueUpdate(departmentId, updatedState);
  }

  return { success: true, token: updatedToken };
}

export async function completeToken(tokenId: string): Promise<any> {
  const token = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [tokenId]);
  if (!token) return { success: false, message: 'Token not found' };

  const now = new Date().toISOString();
  await run(`
    UPDATE queue_tokens 
    SET status = 'completed', completed_at = ? 
    WHERE id = ?
  `, [now, tokenId]);

  // Advance journey step if matching
  await run(`
    UPDATE journey_steps 
    SET status = 'completed', completed_at = ? 
    WHERE visit_id = ? AND department_id = ? AND status != 'completed'
  `, [now, token.visit_id, token.department_id]);

  // Trigger next journey step to in_progress
  const nextStep = await getOne<any>(
    `SELECT * FROM journey_steps 
     WHERE visit_id = ? AND status = 'pending' 
     ORDER BY step_order ASC LIMIT 1`,
    [token.visit_id]
  );

  if (nextStep) {
    await run(`UPDATE journey_steps SET status = 'in_progress' WHERE id = ?`, [nextStep.id]);
  }

  const allJourneySteps = await query<any>(
    'SELECT * FROM journey_steps WHERE visit_id = ? ORDER BY step_order ASC',
    [token.visit_id]
  );
  emitJourneyUpdate(token.visit_id, allJourneySteps);

  const updatedState = await getDepartmentQueueState(token.department_id);
  if (updatedState) {
    emitQueueUpdate(token.department_id, updatedState);
  }

  return { success: true, token };
}

export async function markTokenMissed(tokenId: string): Promise<any> {
  const token = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [tokenId]);
  if (!token) return { success: false, message: 'Token not found' };

  await run(`UPDATE queue_tokens SET status = 'missed' WHERE id = ?`, [tokenId]);

  const updatedState = await getDepartmentQueueState(token.department_id);
  if (updatedState) {
    emitQueueUpdate(token.department_id, updatedState);
  }

  return { success: true, token };
}

export async function requestTokenRecovery(tokenId: string, reason: string): Promise<any> {
  const token = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [tokenId]);
  if (!token) throw new Error('Token not found');

  const reqId = uuidv4();
  const now = new Date().toISOString();

  await run(`
    INSERT INTO missed_token_requests (id, token_id, visit_id, reason, status, requested_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `, [reqId, tokenId, token.visit_id, reason, now]);

  return { id: reqId, status: 'pending' };
}

export async function resolveRecoveryRequest(requestId: string, approve: boolean): Promise<any> {
  const req = await getOne<any>('SELECT * FROM missed_token_requests WHERE id = ?', [requestId]);
  if (!req) throw new Error('Request not found');

  const now = new Date().toISOString();
  const status = approve ? 'approved' : 'rejected';

  await run(`
    UPDATE missed_token_requests 
    SET status = ?, resolved_at = ? 
    WHERE id = ?
  `, [status, now, requestId]);

  if (approve) {
    // Put token back into queue with priority
    await run(`
      UPDATE queue_tokens 
      SET status = 'waiting', priority = 'urgent' 
      WHERE id = ?
    `, [req.token_id]);

    const token = await getOne<any>('SELECT * FROM queue_tokens WHERE id = ?', [req.token_id]);
    if (token) {
      const updatedState = await getDepartmentQueueState(token.department_id);
      if (updatedState) {
        emitQueueUpdate(token.department_id, updatedState);
      }
    }
  }

  return { success: true, status };
}
