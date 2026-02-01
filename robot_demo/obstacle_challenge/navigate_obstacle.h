#ifndef NAVIGATE_OBSTACLE_H
#define NAVIGATE_OBSTACLE_H

/*
  navigate_obstacle.h

  Section 2 (Obstacle Course) finite state machine interface.

  This file exists so your main .ino can include Section 2
  without mixing its logic into Section 1.
*/

#include <Arduino.h>

// ======================= ULTRASONIC PINS =======================
//
// Used to detect cardboard obstacles.
// Obstacles are NOT detected by color.
//
#define ULTRASONIC_TRIG A0
#define ULTRASONIC_ECHO A1

// ======================= GRIPPER SERVO PIN =======================
//
// Servo controls the claw that holds the box.
// Change this pin if your wiring is different.
//
#define GRIPPER_SERVO_PIN  A2

// ======================= SECTION 2 STATES =======================
//
// Key reliability idea:
// - Each state does one clear job.
// - Avoid mixing obstacle avoidance with box actions.
//
enum ObstacleState {
  OBS_FOLLOW_RED,        // Normal driving along red path
  OBS_DODGE_AWAY,        // Initial turn to avoid obstacle
  OBS_CLEAR_PAST,        // Move forward to fully clear obstacle
  OBS_ARC_BACK_TO_RED,   // Curve back until red is detected again
  OBS_PICKUP_BOX,        // Stop + close gripper at a blue zone
  OBS_DROPOFF_BOX,       // Stop + open gripper at a blue zone
  OBS_FAILSAFE_SEARCH,   // Backup if red detection fails
  OBS_COMPLETE
};

// Reset the FSM when entering Section 2.
// Call once when you switch from Section 1 to Section 2.
void obstacleResetFSM();

// Call repeatedly in loop() while running Section 2.
void navigateObstacleFSM();

#endif
