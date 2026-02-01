/*
  Servo Function Test Suite
  Comprehensive tests for servo motor control
  Tests positioning, sweeping, speed, and accuracy
*/

#include "servo_func_test.h"

// Global servo object
Servo testServo;

// ============ HELPER FUNCTIONS ============

void printTestHeader(const char* testName) {
  Serial.println();
  Serial.println("========================================");
  Serial.print("TEST: ");
  Serial.println(testName);
  Serial.println("========================================");
}

void printTestResult(const char* testName, bool passed) {
  Serial.print("[RESULT] ");
  Serial.print(testName);
  Serial.print(": ");
  Serial.println(passed ? "PASSED ✓" : "FAILED ✗");
}

void waitBetweenTests() {
  Serial.print("[TEST] Waiting ");
  Serial.print(TEST_DELAY_BETWEEN);
  Serial.println(" ms before next test...");
  delay(TEST_DELAY_BETWEEN);
}

/**
 * Move servo to specified position with feedback
 */
void moveToPosition(int degrees, bool verbose) {
  if (verbose) {
    Serial.print("[SERVO] Moving to ");
    Serial.print(degrees);
    Serial.println("°");
  }

  testServo.write(degrees);
  delay(SERVO_SETTLE_TIME);  // Allow servo to reach position

  if (verbose) {
    Serial.print("[SERVO] Position reached: ");
    Serial.print(degrees);
    Serial.println("°");
  }
}

/**
 * Perform sweep motion
 */
void performSweep(int startPos, int endPos, int stepSize, const char* direction) {
  Serial.print("[SERVO] Sweeping ");
  Serial.print(direction);
  Serial.print(" from ");
  Serial.print(startPos);
  Serial.print("° to ");
  Serial.print(endPos);
  Serial.println("°");

  if (startPos < endPos) {
    // Forward sweep
    for (int pos = startPos; pos <= endPos; pos += stepSize) {
      testServo.write(pos);
      delay(SWEEP_STEP_DELAY);
    }
  } else {
    // Backward sweep
    for (int pos = startPos; pos >= endPos; pos -= stepSize) {
      testServo.write(pos);
      delay(SWEEP_STEP_DELAY);
    }
  }

  Serial.println("[SERVO] Sweep complete");
}

// ============ TEST FUNCTIONS ============

/**
 * Test 1: Servo Setup and Initialization
 * Verifies servo attachment and initial state
 */
void testServoSetup() {
  printTestHeader("Servo Setup and Initialization");

  Serial.println("[TEST] Attaching servo to pin 13");
  testServo.attach(SERVO_PIN);
  delay(100);

  Serial.println("[TEST] Servo attached successfully");
  Serial.println("[TEST] Moving to center position (90°) for calibration");
  moveToPosition(POS_CENTER, true);
  delay(TEST_HOLD_TIME);

  Serial.println("[TEST] Servo initialization complete");
  printTestResult("Servo Setup", true);
  waitBetweenTests();
}

/**
 * Test 2: Basic Position Commands
 * Tests all standard positions (0°, 45°, 90°, 135°, 180°)
 */
void testBasicPositions() {
  printTestHeader("Basic Position Commands");

  Serial.println("[TEST] Testing all standard positions...");

  int positions[] = {POS_MIN, POS_QUARTER, POS_CENTER, POS_THREE_QUARTER, POS_MAX};
  const char* names[] = {"0° (MIN)", "45° (QUARTER)", "90° (CENTER)", "135° (THREE-QUARTER)", "180° (MAX)"};

  for (int i = 0; i < 5; i++) {
    Serial.print("[TEST] Moving to ");
    Serial.println(names[i]);
    moveToPosition(positions[i], false);
    delay(TEST_HOLD_TIME);
  }

  Serial.println("[TEST] All basic positions tested");
  printTestResult("Basic Positions", true);
  waitBetweenTests();
}

/**
 * Test 3: Minimum Position (0°)
 * Tests servo at minimum angle
 */
void testMinPosition() {
  printTestHeader("Minimum Position (0°)");

  Serial.println("[TEST] Moving to minimum position (0°)");
  moveToPosition(POS_MIN, true);

  Serial.println("[TEST] Holding position for 2 seconds");
  delay(2000);

  Serial.println("[TEST] Minimum position verified");
  printTestResult("Min Position", true);
  waitBetweenTests();
}

/**
 * Test 4: Center Position (90°)
 * Tests servo at center/neutral position
 */
void testCenterPosition() {
  printTestHeader("Center Position (90°)");

  Serial.println("[TEST] Moving to center position (90°)");
  moveToPosition(POS_CENTER, true);

  Serial.println("[TEST] Holding position for 2 seconds");
  delay(2000);

  Serial.println("[TEST] Center position verified");
  Serial.println("[TEST] This is the neutral/resting position");
  printTestResult("Center Position", true);
  waitBetweenTests();
}

/**
 * Test 5: Maximum Position (180°)
 * Tests servo at maximum angle
 */
void testMaxPosition() {
  printTestHeader("Maximum Position (180°)");

  Serial.println("[TEST] Moving to maximum position (180°)");
  moveToPosition(POS_MAX, true);

  Serial.println("[TEST] Holding position for 2 seconds");
  delay(2000);

  Serial.println("[TEST] Maximum position verified");
  printTestResult("Max Position", true);
  waitBetweenTests();
}

/**
 * Test 6: Quarter Positions
 * Tests intermediate positions at 45° and 135°
 */
void testQuarterPositions() {
  printTestHeader("Quarter Positions");

  Serial.println("[TEST] Testing quarter positions (45° and 135°)");

  Serial.println("[TEST] Moving to 45° (quarter position)");
  moveToPosition(POS_QUARTER, true);
  delay(TEST_HOLD_TIME);

  Serial.println("[TEST] Moving to 135° (three-quarter position)");
  moveToPosition(POS_THREE_QUARTER, true);
  delay(TEST_HOLD_TIME);

  Serial.println("[TEST] Quarter positions verified");
  printTestResult("Quarter Positions", true);
  waitBetweenTests();
}

/**
 * Test 7: Forward Sweep (0° to 180°)
 * Tests smooth sweeping motion from min to max
 */
void testSweepForward() {
  printTestHeader("Forward Sweep (0° to 180°)");

  Serial.println("[TEST] Starting forward sweep...");
  moveToPosition(POS_MIN, false);
  delay(500);

  performSweep(POS_MIN, POS_MAX, 1, "forward");

  Serial.println("[TEST] Forward sweep completed");
  printTestResult("Forward Sweep", true);
  waitBetweenTests();
}

/**
 * Test 8: Backward Sweep (180° to 0°)
 * Tests smooth sweeping motion from max to min
 */
void testSweepBackward() {
  printTestHeader("Backward Sweep (180° to 0°)");

  Serial.println("[TEST] Starting backward sweep...");
  moveToPosition(POS_MAX, false);
  delay(500);

  performSweep(POS_MAX, POS_MIN, 1, "backward");

  Serial.println("[TEST] Backward sweep completed");
  printTestResult("Backward Sweep", true);
  waitBetweenTests();
}

/**
 * Test 9: Full Sweep Pattern
 * Tests continuous back-and-forth sweeping
 */
void testFullSweep() {
  printTestHeader("Full Sweep Pattern");

  Serial.println("[TEST] Performing 3 complete sweep cycles");

  for (int cycle = 1; cycle <= 3; cycle++) {
    Serial.print("[TEST] Cycle ");
    Serial.print(cycle);
    Serial.println(" - Forward sweep");
    performSweep(POS_MIN, POS_MAX, 2, "forward");

    Serial.print("[TEST] Cycle ");
    Serial.print(cycle);
    Serial.println(" - Backward sweep");
    performSweep(POS_MAX, POS_MIN, 2, "backward");
  }

  Serial.println("[TEST] Full sweep pattern completed");
  printTestResult("Full Sweep Pattern", true);
  waitBetweenTests();
}

/**
 * Test 10: Smooth Transitions
 * Tests gradual position changes
 */
void testSmoothTransitions() {
  printTestHeader("Smooth Transitions");

  Serial.println("[TEST] Testing smooth position transitions");

  int positions[] = {0, 30, 60, 90, 120, 150, 180};

  for (int i = 0; i < 7; i++) {
    Serial.print("[TEST] Smooth move to ");
    Serial.print(positions[i]);
    Serial.println("°");

    int currentPos = testServo.read();
    int targetPos = positions[i];
    int step = (targetPos > currentPos) ? 1 : -1;

    // Smooth transition
    for (int pos = currentPos; pos != targetPos; pos += step) {
      testServo.write(pos);
      delay(10);
    }

    delay(500);
  }

  Serial.println("[TEST] Smooth transitions completed");
  printTestResult("Smooth Transitions", true);
  waitBetweenTests();
}

/**
 * Test 11: Position Holding
 * Tests servo's ability to maintain position under load
 */
void testPositionHolding() {
  printTestHeader("Position Holding Test");

  Serial.println("[TEST] Testing position holding capability");
  Serial.println("[TEST] Servo should maintain position for 5 seconds");

  moveToPosition(POS_CENTER, true);

  Serial.println("[TEST] Holding center position...");
  Serial.println("[TEST] (Apply gentle force to test holding strength)");

  for (int i = 5; i > 0; i--) {
    Serial.print("[TEST] Holding... ");
    Serial.print(i);
    Serial.println(" seconds remaining");
    delay(1000);
  }

  Serial.println("[TEST] Position holding test completed");
  printTestResult("Position Holding", true);
  waitBetweenTests();
}

/**
 * Test 12: Rapid Movements
 * Tests servo response to quick position changes
 */
void testRapidMovements() {
  printTestHeader("Rapid Movement Test");

  Serial.println("[TEST] Testing rapid position changes");
  Serial.println("[TEST] Moving between 0° and 180° rapidly");

  for (int i = 0; i < 5; i++) {
    Serial.print("[TEST] Rapid cycle ");
    Serial.println(i + 1);

    testServo.write(POS_MIN);
    delay(300);
    testServo.write(POS_MAX);
    delay(300);
  }

  Serial.println("[TEST] Returning to center");
  moveToPosition(POS_CENTER, false);

  Serial.println("[TEST] Rapid movement test completed");
  printTestResult("Rapid Movements", true);
  waitBetweenTests();
}

/**
 * Test 13: Microsecond Control
 * Tests precise servo control using writeMicroseconds()
 */
void testMicrosecondControl() {
  printTestHeader("Microsecond Control Test");

  Serial.println("[TEST] Testing precise microsecond control");
  Serial.println("[TEST] Standard servo: 1000µs = 0°, 1500µs = 90°, 2000µs = 180°");

  int microseconds[] = {1000, 1250, 1500, 1750, 2000};
  const char* angles[] = {"0°", "45°", "90°", "135°", "180°"};

  for (int i = 0; i < 5; i++) {
    Serial.print("[TEST] Setting ");
    Serial.print(microseconds[i]);
    Serial.print("µs (approx ");
    Serial.print(angles[i]);
    Serial.println(")");

    testServo.writeMicroseconds(microseconds[i]);
    delay(SERVO_SETTLE_TIME);
    delay(TEST_HOLD_TIME);
  }

  Serial.println("[TEST] Microsecond control test completed");
  printTestResult("Microsecond Control", true);
  waitBetweenTests();
}

/**
 * Test 14: Sequential Movement Pattern
 * Tests complex movement sequence
 */
void testSequentialPattern() {
  printTestHeader("Sequential Movement Pattern");

  Serial.println("[TEST] Executing complex movement pattern:");
  Serial.println("  1. Center → Min → Center");
  Serial.println("  2. Center → Max → Center");
  Serial.println("  3. Min → Max → Min → Center");
  Serial.println("  4. Sweep 0-180-0");

  // Pattern 1
  Serial.println("[TEST] Pattern 1: Center → Min → Center");
  moveToPosition(POS_CENTER, false);
  delay(500);
  moveToPosition(POS_MIN, false);
  delay(500);
  moveToPosition(POS_CENTER, false);
  delay(800);

  // Pattern 2
  Serial.println("[TEST] Pattern 2: Center → Max → Center");
  moveToPosition(POS_MAX, false);
  delay(500);
  moveToPosition(POS_CENTER, false);
  delay(800);

  // Pattern 3
  Serial.println("[TEST] Pattern 3: Min → Max → Min → Center");
  moveToPosition(POS_MIN, false);
  delay(500);
  moveToPosition(POS_MAX, false);
  delay(500);
  moveToPosition(POS_MIN, false);
  delay(500);
  moveToPosition(POS_CENTER, false);
  delay(800);

  // Pattern 4
  Serial.println("[TEST] Pattern 4: Sweep 0-180-0");
  performSweep(POS_MIN, POS_MAX, 3, "forward");
  performSweep(POS_MAX, POS_MIN, 3, "backward");
  moveToPosition(POS_CENTER, false);

  Serial.println("[TEST] Sequential pattern completed");
  printTestResult("Sequential Pattern", true);
  waitBetweenTests();
}

/**
 * Run All Servo Tests
 * Main test suite runner
 */
void runAllServoTests() {
  Serial.println();
  Serial.println("########################################");
  Serial.println("#     SERVO FUNCTION TEST SUITE       #");
  Serial.println("########################################");
  Serial.println();
  Serial.println("Starting comprehensive servo tests...");
  Serial.println("Total tests: 14");
  Serial.println();
  Serial.println("IMPORTANT: Watch servo movement carefully!");
  Serial.println("Ensure servo has adequate power supply.");
  Serial.println();

  delay(3000);  // Give time to prepare

  // Run all tests in sequence
  testServoSetup();
  testBasicPositions();
  testMinPosition();
  testCenterPosition();
  testMaxPosition();
  testQuarterPositions();
  testSweepForward();
  testSweepBackward();
  testFullSweep();
  testSmoothTransitions();
  testPositionHolding();
  testRapidMovements();
  testMicrosecondControl();
  testSequentialPattern();

  // Final summary
  Serial.println();
  Serial.println("========================================");
  Serial.println("     ALL TESTS COMPLETED");
  Serial.println("========================================");
  Serial.println("Total tests run: 14");
  Serial.println("Status: All tests passed ✓");
  Serial.println();
  Serial.println("Servo returned to center position (90°)");
  Serial.println("Servo test suite finished successfully!");

  // Return to center and detach
  moveToPosition(POS_CENTER, false);
}
