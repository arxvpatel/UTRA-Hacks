#!/usr/bin/env python3
"""
HC-SR04 Ultrasonic Distance Sensor
Measures distance and alerts when object is too close (30 cm threshold)
"""

from gpiozero import DistanceSensor
import time

GPIO pin configuration
TRIGGER_PIN = 24  # GPIO pin for trigger (output)
ECHO_PIN = 23  # GPIO pin for echo (input)
THRESHOLD_CM = 30  # Distance threshold in centimeters

def notify_too_close(distance):
    """Notify when object is too close"""
    print(f"WARNING: Object too close! Distance: {distance:.2f} cm (Threshold: {THRESHOLD_CM} cm)")
    # You can add additional notification methods here:
    # - LED blink
    # - Buzzer sound
    # - Send alert message
    # - etc.

def main():
    """Main loop"""
    # Initialize HC-SR04 sensor using gpiozero
    # DistanceSensor returns distance in meters by default
    sensor = DistanceSensor(echo=ECHO_PIN, trigger=TRIGGER_PIN, max_distance=4.0)

    try:
        print(f"HC-SR04 Distance Monitor")
        print(f"Threshold: {THRESHOLD_CM} cm")
        print(f"Press Ctrl+C to stop\n")

        while True:
            # Get distance in meters and convert to centimeters
            distance_m = sensor.distance
            distance_cm = distance_m * 100

            if distance_cm > 0:  # Valid measurement
                print(f"Distance: {distance_cm:.2f} cm", end="")

                if distance_cm <= THRESHOLD_CM:
                    notify_too_close(distance_cm)
                else:
                    print(" Safe")
            else:
                print("WARNING: Measurement failed or out of range")

            time.sleep(0.1)  # Wait 100ms between measurements

    except KeyboardInterrupt:
        print("\n\nStopping...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        sensor.close()
        print("Sensor closed")

if name == "main":
    main()