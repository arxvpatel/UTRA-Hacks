/*
  Line Follow Functions
  IR sensor-based line following with color verification
  Uses FSM pattern called from main loop
*/

#include "Arduino.h"
#include "line_follow_func.h"
#include "color_sensor_func.h"

// ============ GLOBAL STATE VARIABLES ============
LineFollowState currentLFState = STATE_LF_FORWARD;

// ============ IR SENSOR FUNCTIONS ============

/**
 * Check if left IR sensor detects the line
 * LOW = line detected, HIGH = no line
 */
bool irLeftDetected() {
  return digitalRead(IR_LEFT_PIN) == LOW;
}

/**
 * Check if right IR sensor detects the line
 * LOW = line detected, HIGH = no line
 */
bool irRightDetected() {
  return digitalRead(IR_RIGHT_PIN) == LOW;
}

// ============ SETUP ============

/**
 * Initialize line follow hardware
 * Call from main setup()
 */
void lineFollowSetup() {
  // IR sensor pins
  pinMode(IR_LEFT_PIN, INPUT);
  pinMode(IR_RIGHT_PIN, INPUT);

  // Motor pins
  motorSetup();

  currentLFState = STATE_LF_FORWARD;
  Serial.println("[LF] Line follow system initialized");
}

// ============ LINE FOLLOW FSM ============

/**
 * Line following state machine
 * Call from main loop() every cycle
 *
 * @param targetColor The color of the line to follow (e.g. "BLACK")
 *
 * Algorithm:
 * - Robot moves forward while color sensor detects the target color
 * - If left IR sensor goes LOW, the line is to the left -> correct left
 * - If right IR sensor goes LOW, the line is to the right -> correct right
 * - Correction continues until the color sensor detects the target color again
 */
void lineFollowFSM(const char* targetColor) {

  Serial.println(targetColor);
  Serial.println(currentLFState);

  bool irLeft = irLeftDetected();
  bool irRight = irRightDetected();
  const char* currentColor = readDominantColor();

  switch (currentLFState) {

    case STATE_LF_FORWARD: {
      motorMoveForward(LINE_FOLLOW_SPEED);

      if (strcmp(currentColor, targetColor) != 0) {  // Check IR sensors for line deviation
        if (irLeft) {
          Serial.println("[LF] Left IR triggered - correcting left");
          currentLFState = STATE_LF_CORRECT_RIGHT;
        }
        else if (irRight) {
          Serial.println("[LF] Right IR triggered - correcting right");
          currentLFState = STATE_LF_CORRECT_LEFT;
        }
      }
      break; }

    case STATE_LF_CORRECT_LEFT: {
      // Left IR detected line, steer left to re-center
      steerLeft(LINE_FOLLOW_TURN_SPEED);

      // Check if color sensor is back on the target line
      if (strcmp(currentColor, targetColor) == 0 || !irLeft) {
        Serial.println("[LF] Back on line - resuming forward");
        currentLFState = STATE_LF_FORWARD;
      }
      break; }

    case STATE_LF_CORRECT_RIGHT: {
      // Right IR detected line, steer right to re-center
      steerRight(LINE_FOLLOW_TURN_SPEED);

      // Check if color sensor is back on the target line
      if (strcmp(currentColor, targetColor) == 0 || !irRight) {
        Serial.println("[LF] Back on line - resuming forward");
        currentLFState = STATE_LF_FORWARD;
      }
      break; }

    case STATE_LF_STOPPED: {
      motorStop();
      break; }

    default: {
      Serial.println("[LF] ERROR: Unknown state");
      motorStop();
      currentLFState = STATE_LF_STOPPED;
      break; }
  }
}
