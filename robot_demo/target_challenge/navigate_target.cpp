/*
Navigate Target Challenge
Robot pathfinding algorithm to locate and stop at black box in center of target
*/

#include "navigate_target.h"
#include "color_sensor_func.h"  // Include color sensor functions
#include "motor_func.h"         // Include motor control functions

// ============ GLOBAL STATE VARIABLES ============
NavigationState currentState = STATE_MOVE_RANDOM;
unsigned long startTime = 0;  // Start time for timing crossings
unsigned long crossingTimeMs = 0;  // Time to cross the target
unsigned long greenCrossingTimeMs = 0;  // Time to cross green zone
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
 * Check if red zone is detected
 */
bool isRedZoneDetected() {
  const char* color = getCurrentColor();
  return strcmp(color, "RED") == 0;
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
    
    case STATE_MOVE_RANDOM: {
      Serial.println("[NAV STATE] MOVE_RANDOM - Moving in starting direction");
      motorMoveForward(MOTOR_SPEED);
      
      if (isBlueZoneDetected()) {
        Serial.println("[NAV] Blue zone detected - stopping");
        motorStop();
        turn180(MOTOR_TURN_SPEED, TURN_180_TIME);
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

      break; }
    
    case STATE_FOUND_FIRST_BLUE: {
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

      break; }
    
    case STATE_RETURN_HALF_TIME: {
      Serial.println("[NAV STATE] RETURN_HALF_TIME - Moving back half distance");
      delay(200);
      turn180(MOTOR_TURN_SPEED, TURN_180_TIME);
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
      break; }
    
    case STATE_TURN_90_SEARCH: {
      Serial.println("[NAV STATE] TURN_90_SEARCH - Turning 90 degrees");
      delay(200);
      turn90Left(MOTOR_TURN_SPEED, TURN_90_TIME);
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
        turn180(MOTOR_TURN_SPEED, TURN_180_TIME);
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
      break; }

    case STATE_GREEN_ZONE: {
      Serial.println("[NAV STATE] GREEN_ZONE - Entering green circle mode");
      Serial.println("[NAV] Adapting algorithm to use RED boundaries");

      // Transition to green zone movement
      inGreenZone = true;
      currentState = STATE_GREEN_MOVE_RANDOM;
      break; }

    case STATE_GREEN_MOVE_RANDOM: {
      Serial.println("[NAV STATE] GREEN_MOVE_RANDOM - Moving until RED boundary");
      motorMoveForward(MOTOR_SPEED);

      if (isRedZoneDetected()) {
        Serial.println("[NAV] RED boundary detected - stopping");
        motorStop();
        turn180(MOTOR_TURN_SPEED, TURN_180_TIME);
        startTime = millis();
        currentState = STATE_GREEN_FOUND_FIRST_RED;
        Serial.println("[NAV STATE] GREEN_FOUND_FIRST_RED - Crossing green zone");
      }
      else if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND in green zone!");
        currentState = STATE_COMPLETE;
        motorStop();
      }
      break; }

    case STATE_GREEN_FOUND_FIRST_RED: {
      motorMoveForward(MOTOR_SPEED);

      if (isRedZoneDetected()) {
        Serial.println("[NAV] Opposite RED boundary detected");
        motorStop();

        unsigned long arrivalTime = millis();
        greenCrossingTimeMs = arrivalTime - startTime;

        Serial.print("[NAV] Green zone crossing time: ");
        Serial.print(greenCrossingTimeMs);
        Serial.println(" ms");

        currentState = STATE_GREEN_RETURN_HALF;
      }
      else if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND while crossing green!");
        currentState = STATE_COMPLETE;
        motorStop();
      }
      break; }

    case STATE_GREEN_RETURN_HALF: {
      Serial.println("[NAV STATE] GREEN_RETURN_HALF - Moving to center of green zone");
      delay(200);
      turn180(MOTOR_TURN_SPEED, TURN_180_TIME);

      unsigned long halfGreenTime = greenCrossingTimeMs / 2;
      Serial.print("[NAV] Half time travel in green: ");
      Serial.print(halfGreenTime);
      Serial.println(" ms");

      motorMoveForward(MOTOR_SPEED);
      delay(halfGreenTime);
      motorStop();

      // Check if we found black box
      if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND at center of green!");
        currentState = STATE_COMPLETE;
        motorStop();
        break;
      }

      currentState = STATE_GREEN_TURN_90;
      break; }

    case STATE_GREEN_TURN_90: {
      Serial.println("[NAV STATE] GREEN_TURN_90 - Turning perpendicular in green zone");
      delay(200);
      turn90Left(MOTOR_TURN_SPEED, TURN_90_TIME);
      currentState = STATE_GREEN_SEARCH_CENTER;
      Serial.println("[NAV STATE] GREEN_SEARCH_CENTER - Searching perpendicular");
      break;

    case STATE_GREEN_SEARCH_CENTER:
      motorMoveForward(MOTOR_SPEED);

      // Look for black box or red boundary
      if (isBlackBoxDetected()) {
        Serial.println("[NAV] BLACK BOX FOUND in green zone!");
        currentState = STATE_COMPLETE;
        motorStop();
        break;
      }
      else if (isRedZoneDetected()) {
        Serial.println("[NAV] RED boundary encountered during green search");
        motorStop();
        delay(200);
        turn180(MOTOR_TURN_SPEED, TURN_180_TIME);
        Serial.println("[NAV] Searching opposite direction");
        motorMoveForward(MOTOR_SPEED);
        // Continue searching in opposite direction
      }
      break; }
    
    case STATE_COMPLETE: {
      Serial.println("[NAV STATE] COMPLETE - Navigation finished!");
      motorStop();
      Serial.println("=== NAVIGATION TARGET CHALLENGE COMPLETE ===");
      return; }
    
    default: {
      Serial.println("[NAV] ERROR: Unknown state");
      motorStop();
      currentState = STATE_COMPLETE;
      break; }
    }
}
