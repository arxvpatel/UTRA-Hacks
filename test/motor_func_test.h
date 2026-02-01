#ifndef MOTOR_FUNC_TEST_H
#define MOTOR_FUNC_TEST_H

#include "Arduino.h"
#include <string.h>
#include <stdio.h>

// Test configuration
#define TEST_SPEED_LOW 100
#define TEST_SPEED_MEDIUM 150
#define TEST_SPEED_HIGH 200
#define TEST_DURATION_SHORT 500   // ms
#define TEST_DURATION_MEDIUM 1000 // ms
#define TEST_DURATION_LONG 2000   // ms
#define TEST_DELAY_BETWEEN 1000   // ms between tests

// Test function prototypes
void runAllMotorTests();
void testMotorSetup();
void testMotorForward();
void testMotorBackward();
void testMotorTurnLeft();
void testMotorTurnRight();
void testMotorStop();
void testTurn180();
void testTurn90Left();
void testTurn90Right();
void testSpeedVariations();
void testSequentialMovements();

// Helper functions
void printTestHeader(const char* testName);
void printTestResult(const char* testName, bool passed);
void waitBetweenTests();

#endif  // MOTOR_FUNC_TEST_H
