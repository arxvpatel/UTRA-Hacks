/*
  Main program for robot color sensing
  Uses color sensor functions from color_sensor_func.ino
*/

#include <Arduino.h>
#include "color_sensor_func.h"

void setup() {
  // Color sensor setup is called from color_sensor_func.ino setup()
  // Re-initialize here if needed or let color_sensor_func handle it
  Serial.begin(9600);
  delay(200);
  
  // Set pin modes
  pinMode(PIN_S0, OUTPUT);
  pinMode(PIN_S1, OUTPUT);
  pinMode(PIN_S2, OUTPUT);
  pinMode(PIN_S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);
  
  // Set frequency scaling to 20% (S0=HIGH, S1=LOW)
  digitalWrite(PIN_S0, HIGH);
  digitalWrite(PIN_S1, LOW);
  
  Serial.println("Robot Color Sensor System Started");
  Serial.print("Black threshold: ");
  Serial.println(BLACK_THRESHOLD);
}

void loop() {
  // Read dominant color from sensor
  const char* color = readDominantColor();
  
  // Use the color value for robot logic here
  // Example:
  // if (strcmp(color, "RED") == 0) { doSomething(); }
  // else if (strcmp(color, "GREEN") == 0) { doSomethingElse(); }
  
  delay(200);
}
