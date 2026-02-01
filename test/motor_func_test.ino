/*
  Motor Function Test Suite - Arduino Sketch

  This sketch runs comprehensive tests for all motor control functions.
  Upload to Arduino to test motor functionality.

  SETUP:
  1. Connect L298N motor driver to Arduino
  2. Connect motors to motor driver
  3. Provide power supply to motors
  4. Upload this sketch
  5. Open Serial Monitor (9600 baud)
  6. Watch test results

  NOTE: Ensure robot has enough space to move safely during tests!
*/

#include "motor_func_test.h"

void setup() {
  // Initialize serial communication
  Serial.begin(9600);

  // Wait for serial port to connect
  while (!Serial) {
    ; // Wait for serial port
  }

  Serial.println();
  Serial.println("Motor Test Suite Initialized");
  Serial.println("Waiting 3 seconds before starting tests...");
  Serial.println("MAKE SURE ROBOT HAS SPACE TO MOVE!");
  delay(3000);

  // Run all motor tests
  runAllMotorTests();
}

void loop() {
  // Tests complete - do nothing
  // You can add interactive test commands here if needed

  // Optional: Run tests again on user input
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'r' || cmd == 'R') {
      Serial.println("Rerunning tests...");
      delay(1000);
      runAllMotorTests();
    } else if (cmd == '1') {
      Serial.println("Running testMotorForward...");
      testMotorForward();
    } else if (cmd == '2') {
      Serial.println("Running testMotorBackward...");
      testMotorBackward();
    } else if (cmd == '3') {
      Serial.println("Running testMotorTurnLeft...");
      testMotorTurnLeft();
    } else if (cmd == '4') {
      Serial.println("Running testMotorTurnRight...");
      testMotorTurnRight();
    } else if (cmd == '5') {
      Serial.println("Running testTurn180...");
      testTurn180();
    } else if (cmd == '6') {
      Serial.println("Running testTurn90Left...");
      testTurn90Left();
    } else if (cmd == '7') {
      Serial.println("Running testTurn90Right...");
      testTurn90Right();
    } else if (cmd == 's' || cmd == 'S') {
      Serial.println("Emergency STOP");
      motorStop();
    } else if (cmd == 'h' || cmd == 'H') {
      printHelp();
    }
  }
}

void printHelp() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("     MOTOR TEST COMMANDS");
  Serial.println("========================================");
  Serial.println("r/R - Rerun all tests");
  Serial.println("1   - Test forward movement");
  Serial.println("2   - Test backward movement");
  Serial.println("3   - Test turn left");
  Serial.println("4   - Test turn right");
  Serial.println("5   - Test 180° turn");
  Serial.println("6   - Test 90° left turn");
  Serial.println("7   - Test 90° right turn");
  Serial.println("s/S - Emergency stop");
  Serial.println("h/H - Show this help menu");
  Serial.println("========================================");
  Serial.println();
}
