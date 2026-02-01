#include "motor_func.h"

/*
  motor_func.cpp

  Implements all low-level motor control.

  Reliability principle:
  - Navigation code should only call these functions.
  - That way, if motion is wrong, you debug in one place.
*/

// ======================= SETUP =======================

void motorSetup() {
  // Configure all motor pins as OUTPUT.
  pinMode(MOTOR_L_IN1, OUTPUT);
  pinMode(MOTOR_L_IN2, OUTPUT);
  pinMode(MOTOR_L_PWM, OUTPUT);

  pinMode(MOTOR_R_IN1, OUTPUT);
  pinMode(MOTOR_R_IN2, OUTPUT);
  pinMode(MOTOR_R_PWM, OUTPUT);

  // Safety: ensure robot is not moving when powered on.
  motorStop();
}

// ======================= BASIC MOTION =======================

void motorMoveForward(int speed) {
  // Left motor forward: IN1 = HIGH, IN2 = LOW
  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor forward: IN1 = HIGH, IN2 = LOW
  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, speed);
}

void motorMoveBackward(int speed) {
  // Left motor backward: IN1 = LOW, IN2 = HIGH
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, HIGH);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor backward
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, HIGH);
  analogWrite(MOTOR_R_PWM, speed);
}

void motorTurnLeft(int speed, unsigned long timeMs) {
  // Turn left in place by:
  // - left wheel backward
  // - right wheel forward

  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, HIGH);
  analogWrite(MOTOR_L_PWM, speed);

  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, speed);

  // Timed turning is not perfect, but it's simple and consistent.
  delay(timeMs);

  // Always stop after a timed turn to avoid drifting.
  motorStop();
}

void motorTurnRight(int speed, unsigned long timeMs) {
  // Turn right in place by:
  // - left wheel forward
  // - right wheel backward

  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, speed);

  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, HIGH);
  analogWrite(MOTOR_R_PWM, speed);

  delay(timeMs);
  motorStop();
}

void motorStop() {
  // Stop left motor
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, 0);

  // Stop right motor
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, 0);
}

// ======================= HELPER TURNS =======================
//
// These values are rough defaults.
// You can tune them if needed.

void turn180() {
  motorTurnRight(120, 1000);
}

void turn90Left() {
  motorTurnLeft(120, 500);
}

void turn90Right() {
  motorTurnRight(120, 500);
}

// ======================= CURVED MOTION =======================

void motorMoveCurve(int leftSpeed, int rightSpeed) {
  /*
    Creates a smooth arc using unequal wheel speeds.

    Differential drive rule:
    - If rightSpeed > leftSpeed -> robot curves LEFT
    - If leftSpeed > rightSpeed -> robot curves RIGHT

    Why Section 2 needs this:
    After dodging a box, the robot may be offset from the red line.
    Driving straight could remain parallel forever.
    Curving forces the robot to cross the red line again.
  */

  // Both wheels forward, different PWM values.
  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, leftSpeed);

  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, rightSpeed);
}
