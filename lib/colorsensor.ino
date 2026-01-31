// pin definitions
#define PIN_S0 7
#define PIN_S1 8
#define PIN_S2 9
#define PIN_S3 10
#define PIN_OUT 2

void setup() {
  Serial.begin(9600); // initialize serial 

  // set pin modes
  pinMode(PIN_S0, OUTPUT);
  pinMode(PIN_S1, OUTPUT);
  pinMode(PIN_S2, OUTPUT);
  pinMode(PIN_S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);
  
  // set the frequency scaling to 20% (S==1; S1=0)
  digitalWrite(PIN_S0,HIGH);
  digitalWrite(PIN_S1,LOW);
  
}
void loop() {
  
  // select photodiodes with red filters 
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, LOW);
  int frequency_red = pulseIn(PIN_OUT, LOW); // read red output frequency
  // print out red frequency value via serial 
  Serial.print("Red = ");
  Serial.print(frequency_red);
  Serial.print("; ");
  delay(100); // short delay between readings 
  
  // select photodiodes with green filters 
  digitalWrite(PIN_S2, HIGH);
  digitalWrite(PIN_S3, HIGH);
  int frequency_green = pulseIn(PIN_OUT, LOW); // read green output frequency
  // print out green frequency value via serial 
  Serial.print("Green = ");
  Serial.print(frequency_green);
  Serial.print("; ");
  delay(100); // short delay between readings 
  
  // select photodiodes with blue filters 
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, HIGH);
  int frequency_blue = pulseIn(PIN_OUT, LOW);  // read blue output frequency
  // print out blue frequency value via serial 
  Serial.print("Blue = ");
  Serial.println(frequency_blue);
  delay(100); // short delay between readings 
  
}