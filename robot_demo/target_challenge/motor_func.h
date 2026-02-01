#include "Arduino.h"
#include <string.h>
#include <stdio.h>

// ============ MOTOR PIN DEFINITIONS ============
// Motor pin definitions (L298N H-Bridge)
// Avoiding color sensor pins: 2, 7, 8, 9, 10
#define MOTOR_L_IN1  4   // Left motor direction pin 1
#define MOTOR_L_IN2  3   // Left motor direction pin 2
#define MOTOR_L_PWM  6   // Left motor PWM (speed control)
#define MOTOR_R_IN1  11  // Right motor direction pin 1
#define MOTOR_R_IN2  12  // Right motor direction pin 2
#define MOTOR_R_PWM  5   // Right motor PWM (speed control)

// ============ FUNCTION PROTOTYPES ============

// Motor initialization
void motorSetup();

// Motor control functions
void motorMoveForward(int speed);
void motorMoveBackward(int speed);
void motorTurnLeft(int speed, unsigned long timeMs);
void motorTurnRight(int speed, unsigned long timeMs);
void motorStop();

// Steering helpers (non-blocking, for continuous correction)
void steerLeft(int speed);
void steerRight(int speed);

void turn180(int speed, unsigned long timeMs);
void turn90Left(int speed, unsigned long timeMs);
void turn90Right(int speed, unsigned long timeMs);