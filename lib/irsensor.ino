/*
  IR Obstacle / Proximity Sensors - Arduino R4 Minima
  For digital IR modules (e.g. FC-51, TCRT5000) with 3 pins: VCC, GND, OUT.
  Detects obstacles: LOW = obstacle, HIGH = clear (typical for most modules).
*/

// GPIO pin configuration - adjust for your wiring
const int IR_LEFT_PIN = 19;   // Left IR sensor digital out
const int IR_RIGHT_PIN = 1;  // Right IR sensor digital out

// Set to true if your module logic is inverted (HIGH = obstacle, LOW = clear)
const bool INVERTED_LOGIC = false;

// Optional: analog pin for reflectance value (if your sensor has analog out)
// Use -1 to disable analog reading
const int IR_ANALOG_PIN = A0;

void setup() {
  Serial.begin(9600);

  pinMode(IR_LEFT_PIN, INPUT);
  pinMode(IR_RIGHT_PIN, INPUT);

  if (IR_ANALOG_PIN >= 0) {
    pinMode(IR_ANALOG_PIN, INPUT);
  }

  Serial.println("IR sensors ready");
}

// Returns true if obstacle detected
bool obstacleDetected(int pin) {
  int raw = digitalRead(pin);
  return INVERTED_LOGIC ? (raw == HIGH) : (raw == LOW);
}

// Read all sensors and return as a simple state
void readIRSensors(bool& left, bool& right) {
  left = obstacleDetected(IR_LEFT_PIN);
  right = obstacleDetected(IR_RIGHT_PIN);
}

void loop() {
  bool left, right;
  readIRSensors(left, right);



  if (IR_ANALOG_PIN >= 0) {
    int analogVal = analogRead(IR_ANALOG_PIN);
    Serial.print(" | Analog:");
    Serial.print(analogVal);
  }
  Serial.println();
  
  Serial.print("IR L:");
  Serial.print(left ? "white" : "black");
  Serial.print(" R:");
  Serial.print(right ? "white" : "black");

  delay(100);
}
