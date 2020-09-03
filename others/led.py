#!/usr/bin/env python
import RPi.GPIO as GPIO
import time

pins = {'pin_R':29, 'pin_G':31}  # pins is a dict
sleep_time =0.5

GPIO.setmode(GPIO.BOARD)       # Numbers GPIOs by physical location
for i in pins:
	GPIO.setup(pins[i], GPIO.OUT)   # Set pins' mode is output
	GPIO.output(pins[i], GPIO.LOW) # Set pins to low(0V) to off led
	print("i is ",i,pins[i])

def loop():	
	while True:
            GPIO.output(pins['pin_R'], GPIO.HIGH)   # Set pins to high(+3.3V) to on led
            print(pins['pin_R']," Red Led is On...")
            time.sleep(sleep_time)
            
            GPIO.output(pins['pin_R'], GPIO.LOW)
            print(pins['pin_R']," Red Led is off...")
            time.sleep(sleep_time)
            
            GPIO.output(pins['pin_G'], GPIO.HIGH)
            print(pins['pin_G']," Green Led is On...")
            time.sleep(sleep_time)
            
            GPIO.output(pins['pin_G'], GPIO.LOW)
            print(pins['pin_G']," Green Led is off...")
            time.sleep(sleep_time)

def destroy():

	for i in pins:
		GPIO.output(pins[i], GPIO.LOW)    # Turn off all leds
	GPIO.cleanup()

if __name__ == "__main__":
	try:
		loop()
	except KeyboardInterrupt:
		destroy()
