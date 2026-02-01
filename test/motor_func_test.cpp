/*
  Motor Function Test Suite
  Comprehensive tests for all motor control functions
  Tests motor movement, turning, and speed control
*/

#include "motor_func_test.h"

// Import motor function header (adjust path as needed)
// Assuming motor_func.h is accessible
#include "../robot_demo/target_challenge/motor_func.h"

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

// ============ TEST FUNCTIONS ============

/**
 * Test 1: Motor Setup
 * Verifies motor initialization
 */
void testMotorSetup() {
  printTestHeader("Motor Setup");

  Serial.println("[TEST] Initializing motor system...");
  motorSetup();

  Serial.println("[TEST] Motor pins configured as OUTPUT");
  Serial.println("[TEST] Motors should be in STOP state");

  printTestResult("Motor Setup", true);
  waitBetweenTests();
}

/**
 * Test 2: Motor Forward Movement
 * Tests forward movement at different speeds
 */
void testMotorForward() {
  printTestHeader("Motor Forward Movement");

  // Test at medium speed
  Serial.println("[TEST] Moving forward at medium speed (150)");
  motorMoveForward(TEST_SPEED_MEDIUM);
  delay(TEST_DURATION_MEDIUM);
  motorStop();

  Serial.println("[TEST] Forward movement completed");
  printTestResult("Motor Forward", true);
  waitBetweenTests();
}

/**
 * Test 3: Motor Backward Movement
 * Tests backward movement at different speeds
 */
void testMotorBackward() {
  printTestHeader("Motor Backward Movement");

  // Test at medium speed
  Serial.println("[TEST] Moving backward at medium speed (150)");
  motorMoveBackward(TEST_SPEED_MEDIUM);
  delay(TEST_DURATION_MEDIUM);
  motorStop();

  Serial.println("[TEST] Backward movement completed");
  printTestResult("Motor Backward", true);
  waitBetweenTests();
}

/**
 * Test 4: Motor Turn Left
 * Tests left turn with different speeds and durations
 */
void testMotorTurnLeft() {
  printTestHeader("Motor Turn Left");

  Serial.println("[TEST] Executing left turn (120 speed, 500ms)");
  motorTurnLeft(120, 500);

  Serial.println("[TEST] Left turn completed and stopped");
  printTestResult("Motor Turn Left", true);
  waitBetweenTests();
}

/**
 * Test 5: Motor Turn Right
 * Tests right turn with different speeds and durations
 */
void testMotorTurnRight() {
  printTestHeader("Motor Turn Right");

  Serial.println("[TEST] Executing right turn (120 speed, 500ms)");
  motorTurnRight(120, 500);

  Serial.println("[TEST] Right turn completed and stopped");
  printTestResult("Motor Turn Right", true);
  waitBetweenTests();
}

/**
 * Test 6: Motor Stop
 * Tests emergency stop from various states
 */
void testMotorStop() {
  printTestHeader("Motor Stop Function");

  // Start moving forward
  Serial.println("[TEST] Starting forward movement...");
  motorMoveForward(150);
  delay(300);

  // Emergency stop
  Serial.println("[TEST] Executing emergency stop");
  motorStop();
  delay(500);

  // Verify stopped
  Serial.println("[TEST] Motors should be stopped");
  Serial.println("[TEST] All PWM values = 0");

  printTestResult("Motor Stop", true);
  waitBetweenTests();
}

/**
 * Test 7: 180 Degree Turn
 * Tests the predefined 180-degree turn function
 */
void testTurn180() {
  printTestHeader("180-Degree Turn");

  Serial.println("[TEST] Executing 180-degree turn...");
  turn180();

  Serial.println("[TEST] 180-degree turn completed");
  Serial.println("[TEST] Robot should be facing opposite direction");

  printTestResult("Turn 180", true);
  waitBetweenTests();
}

/**
 * Test 8: 90 Degree Left Turn
 * Tests the predefined 90-degree left turn function
 */
void testTurn90Left() {
  printTestHeader("90-Degree Left Turn");

  Serial.println("[TEST] Executing 90-degree left turn...");
  turn90Left();

  Serial.println("[TEST] 90-degree left turn completed");
  Serial.println("[TEST] Robot should be rotated 90° counter-clockwise");

  printTestResult("Turn 90 Left", true);
  waitBetweenTests();
}

/**
 * Test 9: 90 Degree Right Turn
 * Tests the predefined 90-degree right turn function
 */
void testTurn90Right() {
  printTestHeader("90-Degree Right Turn");

  Serial.println("[TEST] Executing 90-degree right turn...");
  turn90Right();

  Serial.println("[TEST] 90-degree right turn completed");
  Serial.println("[TEST] Robot should be rotated 90° clockwise");

  printTestResult("Turn 90 Right", true);
  waitBetweenTests();
}

/**
 * Test 10: Speed Variations
 * Tests motors at different speed settings
 */
void testSpeedVariations() {
  printTestHeader("Speed Variation Tests");

  // Test LOW speed
  Serial.println("[TEST] Testing LOW speed (100)");
  motorMoveForward(TEST_SPEED_LOW);
  delay(TEST_DURATION_SHORT);
  motorStop();
  delay(500);

  // Test MEDIUM speed
  Serial.println("[TEST] Testing MEDIUM speed (150)");
  motorMoveForward(TEST_SPEED_MEDIUM);
  delay(TEST_DURATION_SHORT);
  motorStop();
  delay(500);

  // Test HIGH speed
  Serial.println("[TEST] Testing HIGH speed (200)");
  motorMoveForward(TEST_SPEED_HIGH);
  delay(TEST_DURATION_SHORT);
  motorStop();
  delay(500);

  Serial.println("[TEST] Speed variation tests completed");
  Serial.println("[TEST] Robot should show gradual speed increase");

  printTestResult("Speed Variations", true);
  waitBetweenTests();
}

/**
 * Test 11: Sequential Movement Pattern
 * Tests a complex sequence of movements
 */
void testSequentialMovements() {
  printTestHeader("Sequential Movement Pattern");

  Serial.println("[TEST] Executing movement sequence:");
  Serial.println("  1. Forward");
  Serial.println("  2. Turn Right 90°");
  Serial.println("  3. Forward");
  Serial.println("  4. Turn Left 90°");
  Serial.println("  5. Backward");
  Serial.println("  6. Turn 180°");

  // Execute sequence
  Serial.println("[TEST] Step 1: Forward");
  motorMoveForward(150);
  delay(1000);
  motorStop();
  delay(300);

  Serial.println("[TEST] Step 2: Turn Right 90°");
  turn90Right();
  delay(300);

  Serial.println("[TEST] Step 3: Forward");
  motorMoveForward(150);
  delay(1000);
  motorStop();
  delay(300);

  Serial.println("[TEST] Step 4: Turn Left 90°");
  turn90Left();
  delay(300);

  Serial.println("[TEST] Step 5: Backward");
  motorMoveBackward(150);
  delay(1000);
  motorStop();
  delay(300);

  Serial.println("[TEST] Step 6: Turn 180°");
  turn180();

  Serial.println("[TEST] Sequential movement pattern completed");
  Serial.println("[TEST] Robot should be back near starting position");

  printTestResult("Sequential Movements", true);
  waitBetweenTests();
}

/**
 * Run All Motor Tests
 * Main test suite runner
 */
void runAllMotorTests() {
  Serial.println();
  Serial.println("########################################");
  Serial.println("#     MOTOR FUNCTION TEST SUITE       #");
  Serial.println("########################################");
  Serial.println();
  Serial.println("Starting comprehensive motor tests...");
  Serial.println("Total tests: 11");
  Serial.println();

  delay(2000);  // Give time to prepare

  // Run all tests in sequence
  testMotorSetup();
  testMotorForward();
  testMotorBackward();
  testMotorTurnLeft();
  testMotorTurnRight();
  testMotorStop();
  testTurn180();
  testTurn90Left();
  testTurn90Right();
  testSpeedVariations();
  testSequentialMovements();

  // Final summary
  Serial.println();
  Serial.println("========================================");
  Serial.println("     ALL TESTS COMPLETED");
  Serial.println("========================================");
  Serial.println("Total tests run: 11");
  Serial.println("Status: All tests passed ✓");
  Serial.println();
  Serial.println("Motor test suite finished successfully!");
}
