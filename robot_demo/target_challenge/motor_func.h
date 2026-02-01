#include "Arduino.h"
#include <string.h>
#include <stdio.h>

// Function prototypes

// Motor control functions (scaffolding - to be implemented)
void motorMoveForward(int speed);
void motorMoveBackward(int speed);
void motorTurnLeft(int speed, unsigned long timeMs);
void motorTurnRight(int speed, unsigned long timeMs);
void motorStop();

void turn180();
void turn90Left();
void turn90Right();