# Servo Function Test Suite

Comprehensive test cases for servo motor control and positioning.

## Files

- **servo_func_test.h** - Header file with test function prototypes and configuration
- **servo_func_test.cpp** - Test implementation with 14 comprehensive test cases
- **servo_func_test.ino** - Arduino sketch to run the tests with interactive controls

## Test Coverage

### 1. Servo Setup and Initialization
- Verifies servo attachment to PWM pin
- Tests initial center position (90°)
- Confirms servo responsiveness

### 2. Basic Position Commands
- Tests all standard positions: 0°, 45°, 90°, 135°, 180°
- Verifies servo can reach each position
- Checks position accuracy

### 3. Minimum Position Test (0°)
- Tests servo at minimum angle
- Verifies position holding at 0°
- Duration: 2 seconds hold time

### 4. Center Position Test (90°)
- Tests neutral/resting position
- Verifies center positioning accuracy
- Confirms balanced position

### 5. Maximum Position Test (180°)
- Tests servo at maximum angle
- Verifies full range of motion
- Duration: 2 seconds hold time

### 6. Quarter Positions Test
- Tests intermediate positions (45° and 135°)
- Verifies precision at non-standard angles
- Checks smooth transitions between positions

### 7. Forward Sweep (0° to 180°)
- Smooth continuous sweep from min to max
- Step size: 1° increments
- Tests full forward range of motion

### 8. Backward Sweep (180° to 0°)
- Smooth continuous sweep from max to min
- Step size: 1° decrements
- Tests full backward range of motion

### 9. Full Sweep Pattern
- Continuous back-and-forth sweeping
- 3 complete cycles (forward and backward)
- Tests sustained movement and consistency

### 10. Smooth Transitions
- Gradual position changes with small steps
- Tests positions: 0°, 30°, 60°, 90°, 120°, 150°, 180°
- Verifies smooth motion without jerking

### 11. Position Holding Test
- Tests servo's ability to maintain position
- 5-second hold at center position
- Can manually test holding strength

### 12. Rapid Movements Test
- Quick position changes between 0° and 180°
- 5 rapid cycles
- Tests servo response speed and accuracy

### 13. Microsecond Control Test
- Precise control using writeMicroseconds()
- Tests: 1000µs (0°), 1250µs (45°), 1500µs (90°), 1750µs (135°), 2000µs (180°)
- Verifies low-level PWM control

### 14. Sequential Movement Pattern
- Complex movement sequence combining multiple patterns
- Tests state transitions and coordination
- Includes sweeps and position jumps

## Usage

### Option 1: Run All Tests Automatically

1. Open `servo_func_test.ino` in Arduino IDE
2. Connect servo to Arduino:
   - Signal wire → Pin 13 (PWM)
   - Red wire (power) → 5V or external power supply
   - Black/Brown wire (ground) → GND
3. Upload the sketch
4. Open Serial Monitor (9600 baud)
5. Tests will run automatically after 5 seconds

### Option 2: Run Individual Tests Interactively

After tests complete, you can control the servo:

```
Position Commands:
0   - Move to 0° (min)
9   - Move to 90° (center)
1   - Move to 180° (max)

Individual Tests:
2   - Test basic positions
3   - Test min position
4   - Test center position
5   - Test max position
6   - Test forward sweep
7   - Test backward sweep
8   - Test rapid movements

Advanced:
r/R - Rerun all tests
s/S - Run sweep test
f/F - Run full sweep pattern
d/D - Detach servo (stop holding position)
a/A - Attach servo and center
h/H - Show help menu
```

### Option 3: Integration with Existing Code

Include the test functions in your existing sketch:

```cpp
#include "servo_func_test.h"

void setup() {
  Serial.begin(9600);

  // Run specific test
  testServoSetup();
  testBasicPositions();

  // Or run all tests
  runAllServoTests();
}
```

## Hardware Requirements

### Essential Components:
- Arduino board (Uno, Mega, Nano, etc.)
- Standard hobby servo (e.g., SG90, MG996R, HS-311)
- USB cable for Arduino
- Jumper wires (3x)

### Power Requirements:

**Small Servos (SG90, 9g micro servo):**
- Can run from Arduino 5V pin
- Current draw: ~100-200mA
- ⚠️ Only if no other high-current devices

**Standard Servos (MG996R, HS-311):**
- **Recommended**: External 5-6V power supply
- Current draw: 500mA - 2.5A (under load)
- ⚠️ **DO NOT** power from Arduino 5V - may damage board!

### Wiring Diagram:

```
Servo Pinout (standard):
┌─────────┐
│ Brown   │ ──→ GND
│ Red     │ ──→ 5V (external power recommended)
│ Orange  │ ──→ Pin 13 (PWM)
└─────────┘

External Power Setup:
┌──────────┐
│ External │
│ 5-6V PSU │
└────┬─────┘
     ├──→ Servo Red (Positive)
     └──→ Arduino + Servo GND (Common Ground!)
```

## Pin Configuration

```cpp
#define SERVO_PIN 13  // PWM-capable pin
```

To use a different pin, modify `SERVO_PIN` in `servo_func_test.h`.

## Expected Serial Output

```
########################################
#     SERVO FUNCTION TEST SUITE       #
########################################

Starting comprehensive servo tests...
Total tests: 14

========================================
TEST: Servo Setup and Initialization
========================================
[TEST] Attaching servo to pin 13
[TEST] Servo attached successfully
[SERVO] Moving to 90°
[SERVO] Position reached: 90°
[TEST] Servo initialization complete
[RESULT] Servo Setup: PASSED ✓

... (continues for all tests)

========================================
     ALL TESTS COMPLETED
========================================
Total tests run: 14
Status: All tests passed ✓

Servo returned to center position (90°)
Servo test suite finished successfully!
```

## Troubleshooting

### Servo Not Moving
- **Check wiring**: Signal on pin 13, power and ground connected
- **Check power supply**: Ensure adequate voltage (4.8-6V)
- **Check connections**: Loose wires or poor contact
- **Try different servo**: Servo may be damaged

### Servo Jittering/Shaking
- **Insufficient power**: Use external power supply for larger servos
- **Poor power supply**: Use quality regulated power supply
- **Noise interference**: Keep servo wires away from motors
- **Capacitor solution**: Add 100µF capacitor across servo power pins

### Servo Not Reaching Full Range
- **Mechanical obstruction**: Check for physical interference
- **Servo limits**: Some servos have less than 180° range
- **Calibration needed**: Try `writeMicroseconds()` test (Test 13)
- **Damaged gears**: Internal gear damage (replace servo)

### Servo Moving Slowly
- **Low voltage**: Check power supply is 5-6V
- **Weak battery**: Replace or recharge power source
- **Servo type**: Some servos are naturally slower (check specs)

### Serial Output Issues
- **Set baud rate to 9600**
- **Check USB connection**
- **Verify Serial.begin(9600) in setup()**
- **Try pressing reset button**

## Customization

### Adjust Test Parameters

Edit `servo_func_test.h` to customize:

```cpp
#define SERVO_SETTLE_TIME 600      // Increase if servo is slow
#define TEST_HOLD_TIME 1000        // Time to hold each position
#define TEST_DELAY_BETWEEN 2000    // Wait between tests
#define SWEEP_STEP_DELAY 15        // Sweep speed (smaller = faster)
```

### Change Pin Assignment

```cpp
#define SERVO_PIN 9  // Use pin 9 instead of 13
```

### Add Custom Test Positions

In `testBasicPositions()`, modify:

```cpp
int positions[] = {0, 30, 60, 90, 120, 150, 180};  // Add more angles
```

## Advanced Features

### Microsecond Control (Test 13)

For precise control beyond the standard `write()` function:

```cpp
testServo.writeMicroseconds(1500);  // 90° for most servos
```

**Standard PWM values:**
- 1000µs = 0° (minimum)
- 1500µs = 90° (center)
- 2000µs = 180° (maximum)

### Continuous Rotation Servos

For modified continuous rotation servos:
- 1500µs = stopped
- < 1500µs = rotate one direction
- > 1500µs = rotate other direction

## Safety Notes

⚠️ **IMPORTANT SAFETY WARNINGS:**

1. **Power Supply**: Never power large servos (>9g) from Arduino 5V pin
2. **Current Draw**: Servos under load can draw 1-2A - exceeds Arduino limits
3. **Moving Parts**: Keep fingers clear of servo horn during tests
4. **Secure Mounting**: Mount servo securely or ensure free rotation space
5. **Heat**: Servos holding position under load will heat up - this is normal
6. **Damage Prevention**: Use external power supply to prevent Arduino damage

## Integration with Other Tests

These servo tests follow the same structure as other test suites:

- **Color Sensor Tests**: `color_sensor_func.cpp`
- **Motor Tests**: `motor_func_test.cpp`
- **Navigation Tests**: (to be implemented)

Can be combined into a unified hardware test suite.

## Test Results Interpretation

### All Tests Passing Means:
✅ Servo is properly connected
✅ Power supply is adequate
✅ Servo can reach all positions (0-180°)
✅ Servo responds quickly and accurately
✅ Servo can perform sweeps and holds positions
✅ PWM control is working correctly

### Common Test Failures:
❌ **Not moving at all** → Check wiring and power
❌ **Jittering** → Insufficient power supply
❌ **Limited range** → Mechanical issue or wrong servo type
❌ **Slow response** → Low voltage or weak servo

## Specifications Tested

This test suite verifies:

- **Position Accuracy**: ±1-2° (typical for hobby servos)
- **Response Time**: ~600ms to reach new position (adjustable)
- **Range of Motion**: 0° to 180° (full sweep)
- **Holding Strength**: Servo maintains position under light load
- **Speed**: Sweep rate adjustable via SWEEP_STEP_DELAY
- **PWM Control**: Both degree and microsecond control methods

## License

Part of UTRA-Hacks robot project.
