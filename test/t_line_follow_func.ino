/*
  Line Follow Test Program
  Tests IR sensor line following with color verification

  Hardware Setup:
  - Left IR sensor  -> Pin 13
  - Right IR sensor -> Pin 1
  - Color sensor: S0->7, S1->8, S2->9, S3->10, OUT->2
  - L298N Motor Driver:
      Left Motor:  IN1->3, IN2->4, PWM->5
      Right Motor: IN1->11, IN2->12, PWM->6

  Usage:
  1. Upload to Arduino
  2. Open Serial Monitor (9600 baud)
  3. Place robot on a colored line
  4. Change TARGET_COLOR below to match your line color
  5. Send 's' to start, 'x' to stop, 'i' for IR status
*/

#include "color_sensor_func.h"
#include "line_follow_func.h"

// ============ CHANGE THIS TO SET LINE COLOR ============
#define TARGET_COLOR "BLACK"
// Options: "BLACK", "RED", "BLUE", "GREEN"
// ========================================================

#define SERIAL_CHECK_INTERVAL 50  // ms between serial input checks
bool running = false;
unsigned long loopCount = 0;
unsigned long lastStatusTime = 0;
#define STATUS_INTERVAL 2000  // ms between automatic status prints

void setup() {
  Serial.begin(9600);
  delay(500);

  Serial.println("\n========================================");
  Serial.println("   LINE FOLLOW TEST PROGRAM");
  Serial.println("========================================\n");

  // Initialize color sensor
  pinMode(PIN_S0, OUTPUT);
  pinMode(PIN_S1, OUTPUT);
  pinMode(PIN_S2, OUTPUT);
  pinMode(PIN_S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);
  digitalWrite(PIN_S0, HIGH);
  digitalWrite(PIN_S1, LOW);
  Serial.println("Color sensor initialized");

  // Initialize line follow system (sets up IR pins and motors)
  lineFollowSetup();

  // Print configuration
  Serial.println("\nConfiguration:");
  Serial.print("  Target color:    ");
  Serial.println(TARGET_COLOR);
  Serial.print("  Forward speed:   ");
  Serial.println(LINE_FOLLOW_SPEED);
  Serial.print("  Turn speed:      ");
  Serial.println(LINE_FOLLOW_TURN_SPEED);
  Serial.print("  Left IR pin:     ");
  Serial.println(IR_LEFT_PIN);
  Serial.print("  Right IR pin:    ");
  Serial.println(IR_RIGHT_PIN);

  Serial.println("\nCommands (send via Serial Monitor):");
  Serial.println("  's' - Start line following");
  Serial.println("  'x' - Stop line following");
  Serial.println("  'i' - Print IR sensor status");
  Serial.println("  'c' - Print color sensor reading");

  Serial.println("\n========================================");
  Serial.println("Ready. Send 's' to start.");
  Serial.println("========================================\n");
}

void loop() {
  // Check for serial commands
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    handleCommand(cmd);
  }

  if (running) {
    lineFollowFSM(TARGET_COLOR);
    loopCount++;

    // Print periodic status
    if (millis() - lastStatusTime >= STATUS_INTERVAL) {
      printStatus();
      lastStatusTime = millis();
    }
  }

  delay(SERIAL_CHECK_INTERVAL);
}

void handleCommand(char cmd) {
  switch (cmd) {
    case 's':
    case 'S':
      running = true;
      loopCount = 0;
      lastStatusTime = millis();
      Serial.println("\n>> STARTED line following");
      Serial.print(">> Following color: ");
      Serial.println(TARGET_COLOR);
      break;

    case 'x':
    case 'X':
      running = false;
      motorStop();
      Serial.println("\n>> STOPPED line following");
      Serial.print(">> Total FSM cycles: ");
      Serial.println(loopCount);
      break;

    case 'i':
    case 'I':
      printIRStatus();
      break;

    case 'c':
    case 'C':
      printColorReading();
      break;
  }
}

void printIRStatus() {
  bool left = irLeftDetected();
  bool right = irRightDetected();

  Serial.print("[IR] Left: ");
  Serial.print(left ? "LINE" : "---");
  Serial.print("  |  Right: ");
  Serial.println(right ? "LINE" : "---");
}

void printColorReading() {
  const char* color = readDominantColor();
  Serial.print("[COLOR] Detected: ");
  Serial.println(color);
}

void printStatus() {
  Serial.print("[STATUS] Cycles: ");
  Serial.print(loopCount);

  Serial.print("  IR L:");
  Serial.print(irLeftDetected() ? "LINE" : "---");
  Serial.print(" R:");
  Serial.print(irRightDetected() ? "LINE" : "---");

  Serial.print("  Color: ");
  Serial.println(readDominantColor());
}
