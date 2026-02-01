#include "navigate_obstacle.h"
#include "color_sensor_func.h"   // Reuse your existing readDominantColor()
#include "motor_func.h"
#include <Servo.h>
#include <string.h>

/*
  navigate_obstacle.cpp

  Section 2 requirements (based on map/rubric):
  - Navigate red path
  - Avoid obstacles
  - Pick up a box
  - Drop off a box in a blue zone
  - Do it reliably with minimal penalties

  Key design principles used here:
  1) Obstacle detection uses ultrasonic only (cardboard boxes are not black).
  2) Path detection uses color sensor only (we only care about RED and BLUE).
  3) Box pickup/drop happens ONLY when robot is stable (on the line, not turning).
  4) After dodging, robot must ARC back to the red line (not drive straight).
*/

// ======================= TUNING CONSTANTS =======================

// Speed tuning:
// SPEED_FOLLOW should be fast enough for time points,
// but not so fast that turns/obstacles cause crashes.
#define SPEED_FOLLOW 150

// Used for careful movement near pickup/drop and recovery.
#define SPEED_SLOW   115

// Used for dodge turns.
#define SPEED_TURN   120

// Ultrasonic threshold in cm.
// Higher value = earlier braking (safer but slower).
#define OBSTACLE_CM  16

// Timed turn duration for dodge.
// Small turn = small offset. Large turn = bigger offset but more drift risk.
#define DODGE_TURN_TIME    280

// How long to drive forward after dodge to ensure rear wheels clear the obstacle.
#define CLEAR_FORWARD_TIME 520

// Delay between sensor reads.
// Small delay reduces jitter and makes readings more stable.
#define SENSOR_DELAY_MS    35

// Arc return speeds (semi-circle behavior).
// "Inner" wheel is slower, "outer" wheel is faster.
#define ARC_INNER_SPEED 105
#define ARC_OUTER_SPEED 160

// If arc runs too long without seeing red, trigger failsafe.
#define ARC_TIMEOUT_MS  1200

// Failsafe widening search steps:
#define FAILSAFE_TURN_TIME    160
#define FAILSAFE_FORWARD_TIME 200

// Servo angles for gripper.
// Adjust these to match your physical claw.
#define GRIPPER_OPEN_ANGLE   20
#define GRIPPER_CLOSE_ANGLE  90

// ======================= FSM STATE VARIABLES =======================

// Current section 2 state
static ObstacleState state = OBS_FOLLOW_RED;

// Track last dodge direction to arc back the opposite way.
// If we dodged RIGHT, we usually want to arc LEFT to re-center.
static bool dodgeRight = true;

// Track whether we are currently carrying a box.
// This prevents pickup/drop from repeating incorrectly.
static bool hasBox = false;

// Used to time out arc recovery.
static unsigned long arcStartMs = 0;

// Failsafe counter to make recovery pattern widen gradually.
static int failsafeStep = 0;

// Servo object for gripper control.
static Servo gripper;

// ======================= ULTRASONIC FUNCTION =======================

static long readUltrasonicCM() {
  /*
    Sends a ping and reads echo time.

    Returns:
    - Distance in cm
    - 999 if no echo (treat as clear path)

    Reliability:
    - Simple threshold check works well for cardboard boxes.
  */

  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);

  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 25000);

  if (duration == 0) {
    // No echo: assume nothing in front close enough
    return 999;
  }

  // Convert microseconds to cm (standard ultrasonic conversion)
  return duration / 58;
}

// ======================= COLOR HELPERS =======================

static bool isRed() {
  // We only care if we are on the red path.
  return strcmp(readDominantColor(), "RED") == 0;
}

static bool isBlue() {
  // Blue zones are used for box pickup/drop triggers.
  return strcmp(readDominantColor(), "BLUE") == 0;
}

// ======================= RESET FUNCTION =======================

void obstacleResetFSM() {
  /*
    Call this once when switching into Section 2.

    Purpose:
    - Clear any old state
    - Ensure servo is ready
    - Start with gripper open
  */

  state = OBS_FOLLOW_RED;
  dodgeRight = true;
  hasBox = false;
  arcStartMs = 0;
  failsafeStep = 0;

  motorStop();

  // Attach servo only once per section entry.
  // If your servo jitters, you can detach it after actions.
  gripper.attach(GRIPPER_SERVO_PIN);

  // Start with open gripper so pickup can close onto box.
  gripper.write(GRIPPER_OPEN_ANGLE);
}

// ======================= MAIN SECTION 2 FSM =======================

void navigateObstacleFSM() {

  switch (state) {

    // ---------------------------------------------------------
    // STATE: FOLLOW RED PATH
    // ---------------------------------------------------------
    case OBS_FOLLOW_RED: {

      /*
        This is the main driving state.
        It is also the ONLY place where we allow box pickup/drop actions.

        Why:
        - The robot is stable and aligned
        - It is not turning
        - Ultrasonic sensor is pointing forward
      */

      // If we see BLUE, we are at a pickup/drop zone.
      // We immediately stop to do a stable servo action.
      if (isBlue()) {
        motorStop();

        // If we do not have a box, this blue zone is used for pickup.
        // If we have a box, this blue zone is used for drop-off.
        state = hasBox ? OBS_DROPOFF_BOX : OBS_PICKUP_BOX;
        break;
      }

      // If we drift off red, we must recover using an arc.
      // This is a crucial geometry fix for reliability.
      if (!isRed()) {
        motorStop();
        arcStartMs = millis();
        state = OBS_ARC_BACK_TO_RED;
        break;
      }

      // Normal forward driving on the red path.
      motorMoveForward(SPEED_FOLLOW);

      // Obstacle detection is highest priority while moving.
      // Touching obstacles costs points, so we stop early.
      if (readUltrasonicCM() < OBSTACLE_CM) {
        motorStop();
        state = OBS_DODGE_AWAY;
        break;
      }

      delay(SENSOR_DELAY_MS);
      break;
    }

    // ---------------------------------------------------------
    // STATE: PICKUP BOX AT BLUE ZONE
    // ---------------------------------------------------------
    case OBS_PICKUP_BOX: {

      /*
        Pickup sequence:

        Reliability > speed here.
        The goal is to secure the box without dragging it out of the zone.

        Assumption:
        - Robot is positioned so gripper can grab the box when stopped.
      */

      motorStop();

      // Make sure gripper is open before grabbing.
      gripper.write(GRIPPER_OPEN_ANGLE);
      delay(300);

      // Close gripper to grab the box.
      gripper.write(GRIPPER_CLOSE_ANGLE);
      delay(500);

      // Mark that we have the box.
      hasBox = true;

      // Small reverse helps:
      // - clear the box from the zone edge
      // - avoid pushing the box along the ground
      motorMoveBackward(SPEED_SLOW);
      delay(200);
      motorStop();

      // Return to normal navigation
      state = OBS_FOLLOW_RED;
      break;
    }

    // ---------------------------------------------------------
    // STATE: DROP OFF BOX AT BLUE ZONE
    // ---------------------------------------------------------
    case OBS_DROPOFF_BOX: {

      /*
        Drop-off sequence:

        Goal:
        - Release box while stopped so it remains in the blue zone.
        - Move back slightly so we do not re-contact it.
      */

      motorStop();

      // Open gripper to release.
      gripper.write(GRIPPER_OPEN_ANGLE);
      delay(500);

      // Mark box as dropped.
      hasBox = false;

      // Back up slightly to avoid nudging the box out of the zone.
      motorMoveBackward(SPEED_SLOW);
      delay(200);
      motorStop();

      // Resume path following.
      state = OBS_FOLLOW_RED;
      break;
    }

    // ---------------------------------------------------------
    // STATE: DODGE AWAY FROM OBSTACLE
    // ---------------------------------------------------------
    case OBS_DODGE_AWAY: {

      /*
        Dodge logic:

        We do a small timed turn to create a lateral offset.
        Then we drive forward to clear the obstacle.

        We alternate dodge direction each time to reduce drift bias.
      */

      dodgeRight = !dodgeRight;

      if (dodgeRight) {
        motorTurnRight(SPEED_TURN, DODGE_TURN_TIME);
      } else {
        motorTurnLeft(SPEED_TURN, DODGE_TURN_TIME);
      }

      delay(80);

      // After turning away, we need to move forward to clear.
      state = OBS_CLEAR_PAST;
      break;
    }

    // ---------------------------------------------------------
    // STATE: CLEAR PAST OBSTACLE
    // ---------------------------------------------------------
    case OBS_CLEAR_PAST: {

      /*
        This forward move ensures the entire robot clears the obstacle.
        If we try to arc back too early, rear wheels can clip the box.
      */

      motorMoveForward(SPEED_FOLLOW);
      delay(CLEAR_FORWARD_TIME);

      motorStop();

      // Now that obstacle is behind us, we arc back to red.
      arcStartMs = millis();
      state = OBS_ARC_BACK_TO_RED;
      break;
    }

    // ---------------------------------------------------------
    // STATE: ARC BACK TO RED PATH (CRITICAL)
    // ---------------------------------------------------------
    case OBS_ARC_BACK_TO_RED: {

      /*
        This is the geometry fix you pointed out:

        After dodging, we may be parallel to the red line.
        Driving straight might never re-intersect red.

        So we force intersection by moving in a smooth arc using unequal PWM.
      */

      // If red is detected, we re-lock instantly and resume normal mode.
      if (isRed()) {
        motorStop();
        state = OBS_FOLLOW_RED;
        break;
      }

      // Arc direction depends on how we dodged.
      // If we dodged right, we arc left to return toward the line.
      if (dodgeRight) {
        // Right wheel faster => curve left
        motorMoveCurve(ARC_INNER_SPEED, ARC_OUTER_SPEED);
      } else {
        // Left wheel faster => curve right
        motorMoveCurve(ARC_OUTER_SPEED, ARC_INNER_SPEED);
      }

      // Prevent getting stuck in arc forever due to lighting/glitches.
      if (millis() - arcStartMs > ARC_TIMEOUT_MS) {
        motorStop();
        failsafeStep = 0;
        state = OBS_FAILSAFE_SEARCH;
        break;
      }

      delay(SENSOR_DELAY_MS);
      break;
    }

    // ---------------------------------------------------------
    // STATE: FAILSAFE SEARCH
    // ---------------------------------------------------------
    case OBS_FAILSAFE_SEARCH: {

      /*
        This state is rarely used.
        It exists to save the run if:
        - lighting makes red detection unstable
        - tape is thin
        - sensor angle is slightly off

        Pattern:
        - small turn toward expected red direction
        - small forward step
        Repeats a few times, then returns to arc logic.
      */

      if (isRed()) {
        motorStop();
        state = OBS_FOLLOW_RED;
        break;
      }

      if (failsafeStep % 2 == 0) {
        // Turn slightly toward red direction
        if (dodgeRight) motorTurnLeft(SPEED_TURN, FAILSAFE_TURN_TIME);
        else motorTurnRight(SPEED_TURN, FAILSAFE_TURN_TIME);
      } else {
        // Move forward slowly to cross red
        motorMoveForward(SPEED_SLOW);
        delay(FAILSAFE_FORWARD_TIME);
        motorStop();
      }

      failsafeStep++;

      // After a few attempts, return to arc logic again.
      if (failsafeStep > 7) {
        arcStartMs = millis();
        state = OBS_ARC_BACK_TO_RED;
      }

      delay(60);
      break;
    }

    // ---------------------------------------------------------
    // COMPLETE (not currently used)
    // ---------------------------------------------------------
    case OBS_COMPLETE:
      motorStop();
      return;

    // ---------------------------------------------------------
    // Default safety
    // ---------------------------------------------------------
    default:
      motorStop();
      state = OBS_FOLLOW_RED;
      break;
  }
}
