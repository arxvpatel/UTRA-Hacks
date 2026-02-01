/* HC-SR04 distance sensor. Prints cm and warns when something is too close. */

// GPIO pin configuration
const int TRIGGER_PIN = 11;  // GPIO pin for trigger (output)
const int ECHO_PIN = 12;     // GPIO pin for echo (input)
const float THRESHOLD_CM = 2.0;  // Distance threshold in centimeters

void notifyTooClose(float distance) {
  /*Notify when object is too close*/
  Serial.print("WARNING: Object too close! Distance: ");
  Serial.print(distance, 2);
  Serial.print(" cm (Threshold: ");
  Serial.print(THRESHOLD_CM, 2);
  Serial.println(" cm)");
}

void setup() {
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
}

float getDistance() {
  /*Measure distance from HC-SR04 sensor in centimeters*/
  // Send 10 microsecond pulse to trigger pin
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);
  
  // Measure the time for echo pin to go high and return to low
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout
  
  // Distance = (duration in microseconds / 2) / 29.1
  // (divide by 2 because signal travels to object and back)
  // (29.1 microseconds per cm at room temperature)
  float distance_cm = (duration / 2.0) / 29.1;
  
  return distance_cm;
}

void loop() {
  float distance_cm = getDistance();
  Serial.println(distance_cm);
  
  if (distance_cm > 0 && distance_cm < 400) {  // Valid measurement (0.5cm to 4m)
    Serial.print("Distance: ");
    Serial.print(distance_cm, 2);
    Serial.print(" cm");
    
    if (distance_cm <= THRESHOLD_CM) {
      notifyTooClose(distance_cm);
    } else {
      Serial.println(" Safe");
    }
  } else {
    Serial.println("WARNING: Measurement failed or out of range");
  }
  
  delay(100);
}
