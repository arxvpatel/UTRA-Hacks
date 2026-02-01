/*
Navigate Target Challenge
Robot pathfinding algorithm to locate and stop at black box in center of target
*/

#include "navigate_target.h"
#include "color_sensor_func.h"  // Include color sensor functions
#include "motor_func.h"         // Include motor control functions

// ============ GLOBAL STATE VARIABLES ============
NavigationState currentState = STATE_MOVE_RANDOM;
int currentDirection = 0;  // 0=forward, 1=left, 2=right, 3=backward
unsigned long startTime = 0;  // Start time for timing crossings
unsigned long crossingTimeMs = 0;  // Time to cross the target
bool inGreenZone = false;  // Flag for green zone behavior

// ============ HELPER FUNCTIONS ============

/**
 * Get current color from sensor
 */
char* getCurrentColor() {
  return readDominantColor();
}

/**
 * Check if black box is detected
 */
bool isBlackBoxDetected() {
  const char* color = getCurrentColor();
  return strcmp(color, BLACK_BOX_DETECTED) == 0;
}

/**
 * Check if blue zone is detected
 */
bool isBlueZoneDetected() {
  const char* color = getCurrentColor();
  return strcmp(color, BLUE_ZONE_COLOR) == 0;
}

/**
 * Check if green zone is detected
 */
bool isGreenZoneDetected() {
  const char* color = getCurrentColor();
  return strcmp(color, GREEN_ZONE_COLOR) == 0;
}

/**
 * Wait for a specific color to be detected with timeout
 */
void waitForColorChange(const char* targetColor, unsigned long timeoutMs) {
  unsigned long startTime = millis();
  
  while (millis() - startTime < timeoutMs) {
    const char* currentColor = getCurrentColor();
    
    // Always check for black box - highest priority
    if (isBlackBoxDetected()) {
      Serial.println("[NAV] BLACK BOX DETECTED! Stopping.");
      currentState = STATE_COMPLETE;
      motorStop();
      return;
    }
    
    // Check for target color
    if (strcmp(currentColor, targetColor) == 0) {
      Serial.print("[NAV] Target color detected: ");
      Serial.println(targetColor);
      return;
    }
    
    delay(COLOR_SENSE_DELAY);
  }
  
  Serial.print("[NAV] Timeout waiting for color: ");
  Serial.println(targetColor);
}

/**
 * Measure the time it takes to cross the target
 * Assumes robot is starting from blue zone, moving across
 */
unsigned long measureCrossingTime() {
  Serial.println("[NAV] Starting crossing measurement...");
  motorMoveForward(MOTOR_SPEED);
  
  unsigned long startTime = millis();
  bool firstBlueFound = false;
  
  while (true) {
    // Check for black box first
    if (isBlackBoxDetected()) {
      Serial.println("[NAV] BLACK BOX DETECTED during crossing!");
      currentState = STATE_COMPLETE;
      motorStop();
      return 0;
    }
    
    // Look for blue zone transition
    if (isBlueZoneDetected()) {
      if (!firstBlueFound) {
        // First blue is the starting zone, skip it
        firstBlueFound = true;
      } else {
        // Second blue zone found - crossing complete
        unsigned long elapsedTime = millis() - startTime;
        Serial.print("[NAV] Crossing time: ");
        Serial.print(elapsedTime);
        Serial.println(" ms");
        motorStop();
        return elapsedTime;
      }
    }
    
    // Safety timeout
    if (millis() - startTime > 30000) {
      Serial.println("[NAV] Crossing timeout - target too large?");
      motorStop();
      return 0;
    }
    
    delay(COLOR_SENSE_DELAY);
  }
}

/**
 * Move forward for specified time
 */
void moveForwardTime(unsigned long timeMs) {
  motorMoveForward(MOTOR_SPEED);
  delay(timeMs);
  motorStop();
}

// ============ MAIN NAVIGATION ALGORITHM ============

void navigateTargetFSM() {
  
  switch (currentState) {
    
    case STATE_MOVE_RANDOM:
      Serial.println("[NAV STATE] MOVE_RANDOM - Moving in starting direction");
      motorMoveForward(MOTOR_SPEED);
      
      if (isBlueZoneDetected()) {
        Serial.println("[NAV] Blue zone detected - stopping");
        motorStop();
        turn180();
        startTime = millis();

        Serial.println("[NAV STATE] FOUND_FIRST_BLUE - Turning around to cross");
        currentState = STATE_FOUND_FIRST_BLUE;
      }
      else if (isGreenZoneDetected()) {
        Serial.println("[NAV] Green zone detected - entering green zone mode");
        motorStop();
        inGreenZone = true;
        currentState = STATE_GREEN_ZONE;
      }
      else if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND!");
        currentState = STATE_COMPLETE;
        motorStop();
      }

      break;
    
    case STATE_FOUND_FIRST_BLUE:
      motorMoveForward(MOTOR_SPEED);
      
      if (isBlueZoneDetected()) {
        Serial.println("[NAV] Blue zone detected - stopping");
        motorStop();

        unsigned long arrivalTime = millis();
        crossingTimeMs = arrivalTime - startTime;

        currentState = STATE_RETURN_HALF_TIME;
      }
      else if (isGreenZoneDetected()) {
        Serial.println("[NAV] Green zone detected - entering green zone mode");
        motorStop();
        inGreenZone = true;
        currentState = STATE_GREEN_ZONE;
      }
      else if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND!");
        currentState = STATE_COMPLETE;
        motorStop();
      }

      break;
    
    case STATE_RETURN_HALF_TIME:
      Serial.println("[NAV STATE] RETURN_HALF_TIME - Moving back half distance");
      delay(200);
      turn180();
      unsigned long halfTime = crossingTimeMs / 2;
      Serial.print("[NAV] Half time travel: ");
      Serial.print(halfTime);
      Serial.println(" ms");
      moveForwardTime(halfTime);
      
      // Check if we found black box
      if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND!");
        currentState = STATE_COMPLETE;
        motorStop();
        break;
      }
      
      currentState = STATE_TURN_90_SEARCH;
      break;
    
    case STATE_TURN_90_SEARCH:
      Serial.println("[NAV STATE] TURN_90_SEARCH - Turning 90 degrees");
      delay(200);
      turn90Left();
      currentState = STATE_SEARCH_CENTER;
      Serial.println("[NAV STATE] SEARCH_CENTER - Searching for center");
      break;
    
    case STATE_SEARCH_CENTER:
      motorMoveForward(MOTOR_SPEED);
      
      // Look for black box or blue zone
      if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND!");
        currentState = STATE_COMPLETE;
        motorStop();
        break;
      }
      else if (isBlueZoneDetected()) {
        Serial.println("[NAV] Blue zone encountered during search");
        motorStop();
        delay(200);
        turn180();
        motorMoveForward(MOTOR_SPEED);
        // Continue moving - should encounter black box
      }
      else if (isGreenZoneDetected()) {
        Serial.println("[NAV] Green zone detected - entering green zone mode");
        inGreenZone = true;
        currentState = STATE_GREEN_ZONE;
        motorStop();
        break;
      }
    
    case STATE_GREEN_ZONE:
      Serial.println("[NAV STATE] GREEN_ZONE - In green circle, adapting algorithm");
      // Similar to main algorithm but stay within red margins instead of blue
      motorMoveForward(MOTOR_SPEED);
      
      // For now, try to move forward and look for black box
      unsigned long greenTimeout = millis();
      while (millis() - greenTimeout < 15000) {
        if (isBlackBoxDetected()) {
          Serial.println("[NAV] BLACK BOX FOUND in green zone!");
          currentState = STATE_COMPLETE;
          motorStop();
          break;
        }
        delay(COLOR_SENSE_DELAY);
      }
      
      if (currentState != STATE_COMPLETE) {
        Serial.println("[NAV] Green zone search timeout, returning to main algorithm");
        motorStop();
        inGreenZone = false;
        currentState = STATE_MOVE_RANDOM;
        setRandomDirection();
      }
      break;
    
    case STATE_COMPLETE:
      Serial.println("[NAV STATE] COMPLETE - Navigation finished!");
      motorStop();
      Serial.println("=== NAVIGATION TARGET CHALLENGE COMPLETE ===");
      return;
    
    default:
      Serial.println("[NAV] ERROR: Unknown state");
      motorStop();
      currentState = STATE_COMPLETE;
      break;
    }
}
