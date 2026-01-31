#include <Servo.h>

// change this to the number of steps on your motor
#define STEPS 180

Servo servo1;

// the previous reading from the analog input
// int previous = 0;

void setup() {
  // set the speed of the motor to 30 RPMs
  servo1.attach(5);
}

void loop() {
  servo1.write(0);
  delay(1000);
  servo1.write(90);
  delay(1000);
  servo1.write(180);
  delay(1000);
}