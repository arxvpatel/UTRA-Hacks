#ifndef SERVO_FUNC_TEST_H
#define SERVO_FUNC_TEST_H

#include "Arduino.h"
#include <Servo.h>

// Servo configuration
#define SERVO_PIN 13  // PWM pin for servo signal

// Test positions (degrees)
#define POS_MIN 0
#define POS_QUARTER 45
#define POS_CENTER 90
#define POS_THREE_QUARTER 135
#define POS_MAX 180

// Timing configuration (milliseconds)
#define SERVO_SETTLE_TIME 600      // Time for servo to reach position
#define TEST_HOLD_TIME 1000        // Time to hold position during test
#define TEST_DELAY_BETWEEN 2000    // Delay between tests
#define SWEEP_STEP_DELAY 15        // Delay between sweep steps

// Servo object
extern Servo testServo;

// Test function prototypes
void runAllServoTests();
void testServoSetup();
void testBasicPositions();
void testMinPosition();
void testCenterPosition();
void testMaxPosition();
void testQuarterPositions();
void testSweepForward();
void testSweepBackward();
void testFullSweep();
void testSmoothTransitions();
void testPositionHolding();
void testRapidMovements();
void testMicrosecondControl();
void testSequentialPattern();

// Helper functions
void printTestHeader(const char* testName);
void printTestResult(const char* testName, bool passed);
void waitBetweenTests();
void moveToPosition(int degrees, bool verbose = true);
void performSweep(int startPos, int endPos, int stepSize, const char* direction);

#endif  // SERVO_FUNC_TEST_H
