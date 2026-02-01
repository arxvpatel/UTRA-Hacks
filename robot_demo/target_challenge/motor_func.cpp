#include "Arduino.h"
#include "motor_func.h"

// ============ MOTOR SETUP ============

/**
 * Initialize motor pins
 * Call this from setup() in main .ino file
 */
void motorSetup() {
  pinMode(MOTOR_L_IN1, OUTPUT);
  pinMode(MOTOR_L_IN2, OUTPUT);
  pinMode(MOTOR_L_PWM, OUTPUT);
  pinMode(MOTOR_R_IN1, OUTPUT);
  pinMode(MOTOR_R_IN2, OUTPUT);
  pinMode(MOTOR_R_PWM, OUTPUT);

  // Start with motors stopped
  motorStop();

  Serial.println("[MOTOR] Motor system initialized");
}

// ============ MOTOR CONTROL FUNCTIONS ============

/**
 * Move robot forward at specified speed
 * Speed: 0-255 PWM value
 */
void motorMoveForward(int speed) {
  // Left motor forward
  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor forward
  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, speed);

  Serial.print("[MOTOR] Forward at speed: ");
  Serial.println(speed);
}

/**
 * Move robot backward at specified speed
 */
void motorMoveBackward(int speed) {
  // Left motor backward
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, HIGH);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor backward
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, HIGH);
  analogWrite(MOTOR_R_PWM, speed);

  Serial.print("[MOTOR] Backward at speed: ");
  Serial.println(speed);
}

/**
 * Turn robot left for specified time
 * Left motor backward, right motor forward
 */
void motorTurnLeft(int speed, unsigned long timeMs) {
  Serial.print("[MOTOR] Turn left at speed: ");
  Serial.print(speed);
  Serial.print(" for ");
  Serial.print(timeMs);
  Serial.println(" ms");

  // Left motor backward
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, HIGH);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor forward
  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, speed);

  delay(timeMs);
  motorStop();
}

/**
 * Turn robot right for specified time
 * Left motor forward, right motor backward
 */
void motorTurnRight(int speed, unsigned long timeMs) {
  Serial.print("[MOTOR] Turn right at speed: ");
  Serial.print(speed);
  Serial.print(" for ");
  Serial.print(timeMs);
  Serial.println(" ms");

  // Left motor forward
  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor backward
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, HIGH);
  analogWrite(MOTOR_R_PWM, speed);

  delay(timeMs);
  motorStop();
}

/**
 * Stop all motors
 */
void motorStop() {
  // Stop left motor
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, 0);

  // Stop right motor
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, 0);

  Serial.println("[MOTOR] Stop");
}

// ============ STEERING HELPERS ============
// Non-blocking continuous steering for line correction.
// Different from motor_func's timed turns - these keep
// steering until the FSM decides to stop.

/**
 * Steer robot left (stop left motor, keep right motor forward)
 */
void steerLeft(int speed) {
  // Left motor stop
  digitalWrite(MOTOR_L_IN1, LOW);
  digitalWrite(MOTOR_L_IN2, HIGH);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor forward
  digitalWrite(MOTOR_R_IN1, HIGH);
  digitalWrite(MOTOR_R_IN2, LOW);
  analogWrite(MOTOR_R_PWM, speed);

  Serial.println("[Motor] Steering left!");
}

/**
 * Steer robot right (keep left motor forward, stop right motor)
 */
void steerRight(int speed) {
  // Left motor forward
  digitalWrite(MOTOR_L_IN1, HIGH);
  digitalWrite(MOTOR_L_IN2, LOW);
  analogWrite(MOTOR_L_PWM, speed);

  // Right motor stop
  digitalWrite(MOTOR_R_IN1, LOW);
  digitalWrite(MOTOR_R_IN2, HIGH);
  analogWrite(MOTOR_R_PWM, speed);

  Serial.println("[Motor] Steering right!");
}

// ============ HELPER TURN FUNCTIONS ============

/**
 * Turn around 180 degrees
 * @param speed Motor PWM speed for turning
 * @param timeMs Duration of the turn in milliseconds
 */
void turn180(int speed, unsigned long timeMs) {
  Serial.println("[MOTOR] Executing 180-degree turn");
  motorTurnRight(speed, timeMs);
  delay(100);
  motorStop();
}

/**
 * Turn 90 degrees left
 * @param speed Motor PWM speed for turning
 * @param timeMs Duration of the turn in milliseconds
 */
void turn90Left(int speed, unsigned long timeMs) {
  Serial.println("[MOTOR] Executing 90-degree left turn");
  motorTurnLeft(speed, timeMs);
  delay(100);
  motorStop();
}

/**
 * Turn 90 degrees right
 * @param speed Motor PWM speed for turning
 * @param timeMs Duration of the turn in milliseconds
 */
void turn90Right(int speed, unsigned long timeMs) {
  Serial.println("[MOTOR] Executing 90-degree right turn");
  motorTurnRight(speed, timeMs);
  delay(100);
  motorStop();
}