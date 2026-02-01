#ifndef MOTOR_FUNC_H
#define MOTOR_FUNC_H

/*
  motor_func.h

  Shared motor interface for BOTH sections:
  - Section 1 (Target Shooting) uses forward, turns, and stop
  - Section 2 (Obstacle Course) uses the same + motorMoveCurve()

  Keeping all motor control in one module prevents duplicated logic
  and makes debugging easier.
*/

#include "Arduino.h"

// ======================= PIN DEFINITIONS =======================
//
// L298N motor driver uses:
// - IN1/IN2: direction
// - PWM: speed (0 to 255)
//
// These pins were chosen to avoid conflicts with color sensor pins.
//
#define MOTOR_L_IN1  3
#define MOTOR_L_IN2  4
#define MOTOR_L_PWM  5

#define MOTOR_R_IN1  11
#define MOTOR_R_IN2  12
#define MOTOR_R_PWM  6

// ======================= SETUP =======================

// Call once in setup() to configure motor pins as outputs.
void motorSetup();

// ======================= BASIC MOTION =======================
//
// These are the simplest, most reliable movement primitives.
// Navigation code should use these instead of writing pins directly.
//

// Drive straight forward at PWM speed (0 to 255).
void motorMoveForward(int speed);

// Drive straight backward at PWM speed.
void motorMoveBackward(int speed);

// Turn left in place for a fixed amount of time.
// This is a "pivot" turn: one wheel forward, one wheel backward.
void motorTurnLeft(int speed, unsigned long timeMs);

// Turn right in place for a fixed amount of time.
void motorTurnRight(int speed, unsigned long timeMs);

// Stop both motors immediately.
// Used for safety, accurate actions, and stable sensing.
void motorStop();

// ======================= HELPER TURNS =======================
//
// These are convenient wrappers that many teams use.
// Section 1 already uses these ideas.
//

void turn180();
void turn90Left();
void turn90Right();

// ======================= CURVED MOTION =======================
//
// This creates a smooth arc ("semi-circle style") by setting different
// PWM speeds on the two wheels.
//
// Why this matters:
// - After dodging an obstacle, driving straight can stay parallel to the red line.
// - An arc guarantees intersection with the red line again.
//
void motorMoveCurve(int leftSpeed, int rightSpeed);

#endif
