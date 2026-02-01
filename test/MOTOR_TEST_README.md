# Motor Function Test Suite

Comprehensive test cases for all motor control functions in `motor_func.cpp`.

## Files

- **motor_func_test.h** - Header file with test function prototypes and configuration
- **motor_func_test.cpp** - Test implementation with 11 comprehensive test cases
- **motor_func_test.ino** - Arduino sketch to run the tests

## Test Coverage

### 1. Motor Setup Test
- Verifies motor pin initialization
- Checks initial STOP state
- Confirms OUTPUT pin configuration

### 2. Motor Forward Movement Test
- Tests forward movement at medium speed (150)
- Duration: 1000ms
- Verifies proper direction control

### 3. Motor Backward Movement Test
- Tests backward movement at medium speed (150)
- Duration: 1000ms
- Verifies reverse direction control

### 4. Motor Turn Left Test
- Tests left turn functionality
- Speed: 120, Duration: 500ms
- Verifies differential motor control

### 5. Motor Turn Right Test
- Tests right turn functionality
- Speed: 120, Duration: 500ms
- Verifies differential motor control

### 6. Motor Stop Test
- Tests emergency stop from moving state
- Verifies immediate motor shutdown
- Checks PWM = 0 for all motors

### 7. 180-Degree Turn Test
- Tests predefined turn180() function
- Verifies robot rotates to opposite direction
- Duration: ~1000ms

### 8. 90-Degree Left Turn Test
- Tests predefined turn90Left() function
- Verifies 90° counter-clockwise rotation
- Duration: ~500ms

### 9. 90-Degree Right Turn Test
- Tests predefined turn90Right() function
- Verifies 90° clockwise rotation
- Duration: ~500ms

### 10. Speed Variation Test
- Tests LOW speed (100 PWM)
- Tests MEDIUM speed (150 PWM)
- Tests HIGH speed (200 PWM)
- Verifies gradual speed changes

### 11. Sequential Movement Pattern Test
- Complex movement sequence:
  1. Forward → 2. Right 90° → 3. Forward
  4. Left 90° → 5. Backward → 6. Turn 180°
- Tests integration of multiple functions
- Verifies state transitions

## Usage

### Option 1: Run All Tests Automatically

1. Open `motor_func_test.ino` in Arduino IDE
2. Connect your Arduino with motor driver
3. Upload the sketch
4. Open Serial Monitor (9600 baud)
5. Tests will run automatically after 3 seconds

### Option 2: Run Individual Tests Interactively

After tests complete, you can run individual tests:

```
r/R - Rerun all tests
1   - Test forward movement
2   - Test backward movement
3   - Test turn left
4   - Test turn right
5   - Test 180° turn
6   - Test 90° left turn
7   - Test 90° right turn
s/S - Emergency stop
h/H - Show help menu
```

### Option 3: Integration with Existing Code

Include the test functions in your existing sketch:

```cpp
#include "motor_func_test.h"

void setup() {
  Serial.begin(9600);

  // Run specific test
  testMotorForward();

  // Or run all tests
  runAllMotorTests();
}
```

## Hardware Requirements

- Arduino board (Uno, Mega, etc.)
- L298N motor driver
- 2x DC motors
- Power supply for motors (6-12V recommended)
- USB cable for Arduino

## Pin Configuration

Based on `motor_func.h`:

```
Left Motor:
- IN1: Pin 3
- IN2: Pin 4
- PWM: Pin 5

Right Motor:
- IN1: Pin 11
- IN2: Pin 12
- PWM: Pin 6
```

## Safety Notes

⚠️ **IMPORTANT**: Ensure robot has adequate space to move during tests!

- Clear at least 2x2 meters of space
- Place robot on floor (not elevated surface)
- Keep hands clear during tests
- Have emergency stop ready (press 's' or power off)

## Expected Serial Output

```
########################################
#     MOTOR FUNCTION TEST SUITE       #
########################################

Starting comprehensive motor tests...
Total tests: 11

========================================
TEST: Motor Setup
========================================
[TEST] Initializing motor system...
[MOTOR] Motor system initialized
[TEST] Motor pins configured as OUTPUT
[TEST] Motors should be in STOP state
[RESULT] Motor Setup: PASSED ✓

... (continues for all tests)

========================================
     ALL TESTS COMPLETED
========================================
Total tests run: 11
Status: All tests passed ✓
```

## Troubleshooting

### Motors Not Moving
- Check power supply connection
- Verify motor driver connections
- Check pin definitions match your wiring
- Ensure motors are properly connected to driver

### Incorrect Direction
- Swap motor wires (IN1 ↔ IN2)
- Or modify direction logic in motor_func.cpp

### Weak Movement
- Increase TEST_SPEED values in motor_func_test.h
- Check battery voltage (should be 6-12V)
- Verify motor driver output

### Serial Output Issues
- Set baud rate to 9600
- Check USB connection
- Verify Serial.begin(9600) is called

## Customization

Edit `motor_func_test.h` to customize test parameters:

```cpp
#define TEST_SPEED_LOW 100          // Adjust speed values
#define TEST_SPEED_MEDIUM 150
#define TEST_SPEED_HIGH 200
#define TEST_DURATION_SHORT 500     // Adjust test durations (ms)
#define TEST_DURATION_MEDIUM 1000
#define TEST_DURATION_LONG 2000
#define TEST_DELAY_BETWEEN 1000     // Delay between tests
```

## Integration with Color Sensor Tests

These motor tests follow the same structure as `color_sensor_func.cpp`:

- Similar function naming conventions
- Consistent Serial output format
- Modular test functions
- Can be combined in a single test suite

## License

Part of UTRA-Hacks robot project.
