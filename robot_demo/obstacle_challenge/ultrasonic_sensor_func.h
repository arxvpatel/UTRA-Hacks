/* Ultrasonic pins and range. */
#ifndef ULTRASONIC_SENSOR_FUNC_H
#define ULTRASONIC_SENSOR_FUNC_H

#include "Arduino.h"

// ============ ULTRASONIC SENSOR CONFIGURATION ============
// HC-SR04 wired to analog pins (used as digital GPIO)
#define US_TRIGGER_PIN A3   // Trigger (output)
#define US_ECHO_PIN    A1   // Echo (input)

#define US_TIMEOUT 30000    // pulseIn timeout in microseconds (~5m max)
#define US_MAX_RANGE 400.0  // Maximum valid range in cm
#define US_MIN_RANGE 2.0    // Minimum valid range in cm

// ============ FUNCTION PROTOTYPES ============

// Setup
void ultrasonicSetup();

// Distance measurement
float ultrasonicGetDistance();
bool  ultrasonicIsValid(float distanceCm);
bool  ultrasonicObjectWithin(float thresholdCm);

#endif  // ULTRASONIC_SENSOR_FUNC_H
