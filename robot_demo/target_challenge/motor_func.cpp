import "motor_func.h"

// ============ MOTOR CONTROL FUNCTIONS (SCAFFOLDING) ============

/**
 * Move robot forward at specified speed
 * TODO: Implement with motor driver
 */
void motorMoveForward(int speed) {
  // TODO: Control motors to move forward
  // Serial.print("[MOTOR] Forward at speed: ");
  // Serial.println(speed);
}

/**
 * Move robot backward at specified speed
 * TODO: Implement with motor driver
 */
void motorMoveBackward(int speed) {
  // TODO: Control motors to move backward
  // Serial.print("[MOTOR] Backward at speed: ");
  // Serial.println(speed);
}

/**
 * Turn robot left for specified time
 * TODO: Implement with motor driver
 */
void motorTurnLeft(int speed, unsigned long timeMs) {
  // TODO: Control motors to turn left
  // Serial.print("[MOTOR] Turn left at speed: ");
  // Serial.print(speed);
  // Serial.print(" for ");
  // Serial.print(timeMs);
  // Serial.println(" ms");
}

/**
 * Turn robot right for specified time
 * TODO: Implement with motor driver
 */
void motorTurnRight(int speed, unsigned long timeMs) {
  // TODO: Control motors to turn right
  // Serial.print("[MOTOR] Turn right at speed: ");
  // Serial.print(speed);
  // Serial.print(" for ");
  // Serial.print(timeMs);
  // Serial.println(" ms");
}

/**
 * Stop all motors
 * TODO: Implement with motor driver
 */
void motorStop() {
  // TODO: Stop all motors
  // Serial.println("[MOTOR] Stop");
}

/**
 * Turn around 180 degrees
 */
void turn180() {
  motorTurnRight(MOTOR_TURN_SPEED, TURN_180_TIME);
  delay(100);
  motorStop();
}

/**
 * Turn 90 degrees left
 */
void turn90Left() {
  motorTurnLeft(MOTOR_TURN_SPEED, TURN_90_TIME);
  delay(100);
  motorStop();
}

/**
 * Turn 90 degrees right
 */
void turn90Right() {
  motorTurnRight(MOTOR_TURN_SPEED, TURN_90_TIME);
  delay(100);
  motorStop();
}