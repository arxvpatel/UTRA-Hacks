/*
  Servo Function Test Suite - Arduino Sketch

  This sketch runs comprehensive tests for servo motor control.
  Upload to Arduino to test servo functionality.

  SETUP:
  1. Connect servo signal wire to pin 13 (PWM)
  2. Connect servo power (5V or external power supply)
  3. Connect servo ground to Arduino ground
  4. Upload this sketch
  5. Open Serial Monitor (9600 baud)
  6. Watch test results and servo movement

  IMPORTANT: Ensure servo has adequate power supply!
  - Small servos: Arduino 5V pin (if no other high-draw devices)
  - Standard/large servos: External 5-6V power supply recommended
*/

#include "servo_func_test.h"

void setup() {
  // Initialize serial communication
  Serial.begin(9600);

  // Wait for serial port to connect
  while (!Serial) {
    ; // Wait for serial port
  }

  Serial.println();
  Serial.println("Servo Test Suite Initialized");
  Serial.println();
  Serial.println("⚠️  IMPORTANT SAFETY NOTES:");
  Serial.println("- Ensure servo has adequate power supply");
  Serial.println("- Servo should be mounted securely or free to rotate");
  Serial.println("- Keep hands clear of moving servo horn");
  Serial.println("- If servo jitters/shakes, check power supply");
  Serial.println();
  Serial.println("Waiting 5 seconds before starting tests...");
  delay(5000);

  // Run all servo tests
  runAllServoTests();
}

void loop() {
  // Tests complete - servo at center position
  // Optional: Add interactive test commands

  if (Serial.available() > 0) {
    char cmd = Serial.read();

    if (cmd == 'r' || cmd == 'R') {
      Serial.println("\nRerunning all tests...");
      delay(1000);
      runAllServoTests();
    } else if (cmd == '0') {
      Serial.println("\nMoving to 0°");
      moveToPosition(POS_MIN, true);
    } else if (cmd == '9') {
      Serial.println("\nMoving to 90°");
      moveToPosition(POS_CENTER, true);
    } else if (cmd == '1') {
      Serial.println("\nMoving to 180°");
      moveToPosition(POS_MAX, true);
    } else if (cmd == 's' || cmd == 'S') {
      Serial.println("\nRunning sweep test");
      testSweepForward();
    } else if (cmd == 'f' || cmd == 'F') {
      Serial.println("\nRunning full sweep pattern");
      testFullSweep();
    } else if (cmd == 'd' || cmd == 'D') {
      Serial.println("\nDetaching servo (stops holding position)");
      testServo.detach();
      Serial.println("Servo detached. Type 'a' to reattach.");
    } else if (cmd == 'a' || cmd == 'A') {
      Serial.println("\nAttaching servo to pin 13");
      testServo.attach(SERVO_PIN);
      moveToPosition(POS_CENTER, true);
      Serial.println("Servo attached and centered.");
    } else if (cmd == 'h' || cmd == 'H') {
      printHelp();
    } else if (cmd >= '2' && cmd <= '8') {
      // Move to specific test position
      int testNum = cmd - '0';
      switch (testNum) {
        case 2: testBasicPositions(); break;
        case 3: testMinPosition(); break;
        case 4: testCenterPosition(); break;
        case 5: testMaxPosition(); break;
        case 6: testSweepForward(); break;
        case 7: testSweepBackward(); break;
        case 8: testRapidMovements(); break;
      }
    }
  }
}

void printHelp() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("     SERVO TEST COMMANDS");
  Serial.println("========================================");
  Serial.println("r/R - Rerun all tests");
  Serial.println("0   - Move to 0° (min position)");
  Serial.println("9   - Move to 90° (center position)");
  Serial.println("1   - Move to 180° (max position)");
  Serial.println();
  Serial.println("Individual Tests:");
  Serial.println("2   - Test basic positions");
  Serial.println("3   - Test min position");
  Serial.println("4   - Test center position");
  Serial.println("5   - Test max position");
  Serial.println("6   - Test forward sweep");
  Serial.println("7   - Test backward sweep");
  Serial.println("8   - Test rapid movements");
  Serial.println();
  Serial.println("s/S - Run sweep test");
  Serial.println("f/F - Run full sweep pattern");
  Serial.println("d/D - Detach servo (stop holding)");
  Serial.println("a/A - Attach servo and center");
  Serial.println("h/H - Show this help menu");
  Serial.println("========================================");
  Serial.println();
}
