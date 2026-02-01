#ifndef NAVIGATE_TARGET_H
#define NAVIGATE_TARGET_H

#include <Arduino.h>

// ============ CONFIGURATION MACROS ============
#define MOTOR_SPEED 150        // Motor PWM speed (0-255)
#define MOTOR_TURN_SPEED 120   // Motor speed for turning (0-255)
#define TURN_90_TIME 500       // Time in ms to turn 90 degrees
#define TURN_180_TIME 1000     // Time in ms to turn 180 degrees
#define COLOR_SENSE_DELAY 50   // Delay in ms between color readings
#define TARGET_CROSSING_MARGIN 100  // Safety margin for crossing detection (ms)

// Color thresholds for zone detection
#define BLUE_ZONE_THRESHOLD 150    // Below this = blue zone detected
#define GREEN_ZONE_THRESHOLD 150   // Below this = green zone detected
#define BLACK_BOX_DETECTED "BLACK"  // Black box color string
#define BLUE_ZONE_COLOR "BLUE"     // Blue zone color string
#define GREEN_ZONE_COLOR "GREEN"   // Green zone color string

// State machine states
enum NavigationState {
  STATE_MOVE_RANDOM,       // Moving in starting direction
  STATE_FOUND_FIRST_BLUE,  // Found first blue zone
  STATE_STOPPED_AT_BLUE,   // Stopped when blue detected
  STATE_RETURN_HALF_TIME,  // Returning half the distance
  STATE_TURN_90_SEARCH,    // Turning 90 degrees to search
  STATE_SEARCH_CENTER,     // Searching for center
  STATE_GREEN_ZONE,        // In green zone, modify behavior
  STATE_COMPLETE           // Navigation complete (black box found)
};

// ============ FUNCTION PROTOTYPES ============

// Navigation main function
void navigateTarget();

// Helper functions
void setRandomDirection();
char* getCurrentColor();
bool isBlackBoxDetected();
bool isBlueZoneDetected();
bool isGreenZoneDetected();
void waitForColorChange(const char* targetColor, unsigned long timeoutMs = 10000);
unsigned long measureCrossingTime();

#endif  // NAVIGATE_TARGET_H

