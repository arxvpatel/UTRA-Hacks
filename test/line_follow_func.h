#ifndef LINE_FOLLOW_FUNC_H
#define LINE_FOLLOW_FUNC_H

#include "Arduino.h"
#include "motor_func.h"
#include <string.h>

// ============ IR SENSOR PIN DEFINITIONS ============
#define IR_LEFT_PIN  19  // Left IR sensor
#define IR_RIGHT_PIN A2  // Right IR sensor

// ============ LINE FOLLOW CONFIGURATION ============
#define LINE_FOLLOW_SPEED      150  // Forward speed (0-255)
#define LINE_FOLLOW_TURN_SPEED 120  // Correction turn speed (0-255)
#define CORRECTION_DELAY       50   // ms between corrections

// ============ LINE FOLLOW STATES ============
enum LineFollowState {
  STATE_LF_FORWARD,        // Moving forward on the line
  STATE_LF_CORRECT_LEFT,   // Left IR triggered - correct left
  STATE_LF_CORRECT_RIGHT,  // Right IR triggered - correct right
  STATE_LF_STOPPED         // Line following stopped
};

// ============ FUNCTION PROTOTYPES ============

// Setup
void lineFollowSetup();

// Line follow FSM - takes target line color as parameter
void lineFollowFSM(const char* targetColor);

// IR sensor reading
bool irLeftDetected();
bool irRightDetected();

// Steering helpers (non-blocking, for continuous correction)
void steerLeft(int speed);
void steerRight(int speed);

#endif  // LINE_FOLLOW_FUNC_H
