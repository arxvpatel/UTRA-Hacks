#ifndef COLOR_SENSOR_FUNC_H
#define COLOR_SENSOR_FUNC_H

#include "Arduino.h"
#include <string.h>
#include <stdio.h>

// Pin definitions
#define PIN_S0 7
#define PIN_S1 8
#define PIN_S2 9
#define PIN_S3 10
#define PIN_OUT 2

// Threshold macros
#define BLACK_THRESHOLD 200  // If all RGB values above this, color is black
#define PULSE_TIMEOUT 25000  // Timeout for pulseIn (microseconds)

// function prototypes
unsigned long readPulseUS();
char* readDominantColor();

#endif  // COLOR_SENSOR_FUNC_H