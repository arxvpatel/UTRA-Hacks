/*
  Color Sensor Function for Robot
  Reads TCS3200/TCS230 color sensor and returns dominant color as string
*/

#include "color_sensor_func.h"

// Filter select functions
void setFilterRed()   { digitalWrite(PIN_S2, LOW);  digitalWrite(PIN_S3, LOW);  }
void setFilterGreen() { digitalWrite(PIN_S2, HIGH); digitalWrite(PIN_S3, HIGH); }
void setFilterBlue()  { digitalWrite(PIN_S2, LOW);  digitalWrite(PIN_S3, HIGH); }

// Read pulse period for current filter setting
unsigned long readPulseUS() {
  delay(5);  // Let filter settle
  unsigned long period = pulseIn(PIN_OUT, LOW, PULSE_TIMEOUT);
  return period;
}

// Read color periods, print to serial, and return dominant color as string
char* readDominantColor() {
  // Read red
  setFilterRed();
  unsigned long periodRed = readPulseUS();
  
  // Read green
  setFilterGreen();
  unsigned long periodGreen = readPulseUS();
  
  // Read blue
  setFilterBlue();
  unsigned long periodBlue = readPulseUS();
  
  // Print period values
  Serial.print("Periods (us): R=");
  Serial.print(periodRed);
  Serial.print(" G=");
  Serial.print(periodGreen);
  Serial.print(" B=");
  Serial.print(periodBlue);
  Serial.print(" | Dominant: ");
  
  // Check if black (all values above threshold)
  if (periodRed > BLACK_THRESHOLD && periodGreen > BLACK_THRESHOLD && periodBlue > BLACK_THRESHOLD) {
    Serial.println("BLACK");
    return "BLACK";
  }
  
  // Find dominant color (smallest period = strongest color)
  if (periodRed > 0 && periodGreen > 0 && periodBlue > 0) {
    unsigned long minPeriod = min(periodRed, min(periodGreen, periodBlue));
    
    if (minPeriod == periodRed) {
      Serial.println("RED");
      return "RED";
    } else if (minPeriod == periodGreen) {
      Serial.println("GREEN");
      return "GREEN";
    } else if (minPeriod == periodBlue) {
      Serial.println("BLUE");
      return "BLUE";
    }
  }
  
  Serial.println("UNKNOWN");
  return "UNKNOWN";
}