#ifndef NAVIGATE_TARGET_H
#define NAVIGATE_TARGET_H

#include <Arduino.h>

// ============ CONFIGURATION MACROS ============
#define MOTOR_SPEED 150        // Motor PWM speed (0-255)
#define MOTOR_TURN_SPEED 120   // Motor speed for turning (0-255)
#define TURN_90_TIME 500       // Time in ms to turn 90 degrees
#define TURN_180_TIME 1000     // Time in ms to turn 180 degrees
#define COLOR_SENSE_DELAY 50   // Delay in ms between color readings
// Color strings for zone detection
#define BLACK_BOX_DETECTED "BLACK"  // Black box color string
#define BLUE_ZONE_COLOR "BLUE"     // Blue zone color string
#define GREEN_ZONE_COLOR "GREEN"   // Green zone color string

// State machine states
enum NavigationState {
  STATE_MOVE_RANDOM,           // Moving in starting direction
  STATE_FOUND_FIRST_BLUE,      // Found first blue zone
  STATE_RETURN_HALF_TIME,      // Returning half the distance
  STATE_TURN_90_SEARCH,        // Turning 90 degrees to search
  STATE_SEARCH_CENTER,         // Searching for center
  STATE_GREEN_ZONE,            // Transition - entering green zone
  STATE_GREEN_MOVE_RANDOM,     // Moving until RED boundary
  STATE_GREEN_FOUND_FIRST_RED, // Found first RED, crossing
  STATE_GREEN_RETURN_HALF,     // Returning to center of green
  STATE_GREEN_TURN_90,         // Turning 90 in green zone
  STATE_GREEN_SEARCH_CENTER,   // Searching for black in green
  STATE_COMPLETE               // Navigation complete (black box found)
};

// ============ FUNCTION PROTOTYPES ============

// Navigation main function
void navigateTargetFSM();

// Helper functions
char* getCurrentColor();
bool isBlackBoxDetected();
bool isBlueZoneDetected();
bool isGreenZoneDetected();
bool isRedZoneDetected();

#endif  // NAVIGATE_TARGET_H

