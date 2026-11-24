import { initSchema } from '../server/src/database/schema.js';
import { seedDatabase } from '../server/src/database/seed.js';
import { calculateShortestPath } from '../server/src/services/pathfinding.js';
import { generateQueueToken, callNextPatient, completeToken, markTokenMissed, getPatientTokenInfo } from '../server/src/services/queueService.js';
import { generateToken } from '../server/src/middleware/auth.js';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('--- STARTING DISHA AUTOMATED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Setup
    await initSchema();
    await seedDatabase(true);

    // TEST 1: Pathfinding - Dijkstra Shortest Path
    console.log('\n[1] Testing Dijkstra Pathfinding Algorithm:');
    const standardRoute = await calculateShortestPath('hosp-demo-01', 'N-G-ENTRANCE', 'N-G-OPD', false);
    assert(standardRoute !== null, 'Finds route from Main Entrance to General OPD');
    assert(standardRoute!.steps.length > 0, 'Route contains turn-by-turn steps');
    assert(standardRoute!.totalDistanceMeters > 0, `Calculated distance: ${standardRoute?.totalDistanceMeters}m`);

    // TEST 2: Wheelchair Accessible Route (Excludes Stairs)
    console.log('\n[2] Testing Wheelchair Accessible Route:');
    const stairsRoute = await calculateShortestPath('hosp-demo-01', 'N-G-ENTRANCE', 'N-1-LAB', false);
    const wheelchairRoute = await calculateShortestPath('hosp-demo-01', 'N-G-ENTRANCE', 'N-1-LAB', true);
    
    assert(wheelchairRoute !== null, 'Finds wheelchair-accessible route to First Floor Lab');
    const usesElevator = wheelchairRoute!.path.some(n => n.node_type === 'elevator' || n.id.includes('LIFT'));
    const usesStairs = wheelchairRoute!.path.some(n => n.node_type === 'stairs' || n.id.includes('STAIRS'));
    assert(usesElevator, 'Wheelchair route correctly selects Elevator Lift A');
    assert(!usesStairs, 'Wheelchair route strictly excludes Staircase A');

    // TEST 3: Queue Token Generation
    console.log('\n[3] Testing Queue Token Generation:');
    const newToken = await generateQueueToken('visit-demo-judge', 'dept-lab');
    assert(newToken !== null, 'Generates queue token');
    assert(newToken.token_number.startsWith('LAB-'), `Token has correct department prefix (${newToken.token_number})`);
    assert(newToken.status === 'waiting', 'Initial token status is "waiting"');

    // TEST 4: Queue Progression (Call Next, Complete, Missed)
    console.log('\n[4] Testing Queue Progression Lifecycle:');
    const callResult = await callNextPatient('dept-lab', 'Counter 3');
    assert(callResult.success === true, 'Successfully called next patient');
    assert(callResult.token.status === 'called', 'Called token status changed to "called"');
    assert(callResult.token.counter_number === 'Counter 3', 'Assigned designated counter number');

    const completedResult = await completeToken(callResult.token.id);
    assert(completedResult.success === true, 'Successfully marked token as completed');

    const anotherToken = await generateQueueToken('visit-demo-judge', 'dept-pha');
    const missedResult = await markTokenMissed(anotherToken.id);
    assert(missedResult.success === true, 'Successfully marked token as missed');

    // TEST 5: Patient Ahead and Waiting Time Calculation
    console.log('\n[5] Testing Waiting Time & Ahead Calculations:');
    const patientInfo = await getPatientTokenInfo('OPD-024');
    assert(patientInfo !== null, 'Retrieves patient token info for OPD-024');
    assert(typeof patientInfo!.patientsAhead === 'number', `Patients ahead: ${patientInfo?.patientsAhead}`);
    assert(typeof patientInfo!.estimatedWaitMinutes === 'number', `Estimated wait: ${patientInfo?.estimatedWaitMinutes} mins`);

    // TEST 6: Staff Authorization & JWT Verification
    console.log('\n[6] Testing Staff Authorization & Security:');
    const jwtSecret = process.env.JWT_SECRET || 'disha_hackathon_super_secret_jwt_key_2026';
    const testPayload = { id: 'staff-admin', username: 'admin', role: 'admin' };
    const signedToken = generateToken(testPayload);
    assert(typeof signedToken === 'string' && signedToken.length > 20, 'Generates secure JWT token');
    
    const verified = jwt.verify(signedToken, jwtSecret) as any;
    assert(verified.username === 'admin' && verified.role === 'admin', 'JWT verification validates payload integrity');

    console.log(`\n===============================================`);
    console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log(`===============================================`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
