import time
import os

import RPi.GPIO as GPIO
import click
import json
import requests
from flask import current_app
from flask.cli import with_appcontext
from tracking.readconfig import ReadConfig
from threading import Thread

# KubeEdge node index
nodes = []
index = 0
## Car Status(move or stop)
# move -- 1
# stop -- 0
status = 1
## Car pause time when KubeEdge node not ready
pause_time = 20
## API URL for getting KubeEdge node status
url = ""

T_SensorRight = 26
T_SensorLeft = 13

PWMA = 18
AIN1 = 22
AIN2 = 27

PWMB = 23
BIN1 = 25
BIN2 = 24

BtnPin = 19
Gpin = 5
Rpin = 6

SR = False
SL = False

def read_config():
    global nodes, url, pause_time
    rc = ReadConfig()
    options = rc.get_nodes("node")
    nodes = options.split(",")
    url = rc.get_api("url")
    pause_time = int(rc.get_nodes("pause_time"))

def t_up(speed, t_time):
    L_Motor.ChangeDutyCycle(speed)
    GPIO.output(AIN2, False)  # AIN2
    GPIO.output(AIN1, True)  # AIN1

    R_Motor.ChangeDutyCycle(speed)
    GPIO.output(BIN2, False)  # BIN2
    GPIO.output(BIN1, True)  # BIN1
    time.sleep(t_time)


def t_stop(t_time):
    L_Motor.ChangeDutyCycle(0)
    GPIO.output(AIN2, False)  # AIN2
    GPIO.output(AIN1, False)  # AIN1

    R_Motor.ChangeDutyCycle(0)
    GPIO.output(BIN2, False)  # BIN2
    GPIO.output(BIN1, False)  # BIN1
    time.sleep(t_time)


def t_down(speed, t_time):
    L_Motor.ChangeDutyCycle(speed)
    GPIO.output(AIN2, True)  # AIN2
    GPIO.output(AIN1, False)  # AIN1

    R_Motor.ChangeDutyCycle(speed)
    GPIO.output(BIN2, True)  # BIN2
    GPIO.output(BIN1, False)  # BIN1
    time.sleep(t_time)


def t_left(speed, t_time):
    L_Motor.ChangeDutyCycle(speed)
    GPIO.output(AIN2, True)  # AIN2
    GPIO.output(AIN1, False)  # AIN1

    R_Motor.ChangeDutyCycle(speed)
    GPIO.output(BIN2, False)  # BIN2
    GPIO.output(BIN1, True)  # BIN1
    time.sleep(t_time)


def t_right(speed, t_time):
    L_Motor.ChangeDutyCycle(speed)
    GPIO.output(AIN2, False)  # AIN2
    GPIO.output(AIN1, True)  # AIN1

    R_Motor.ChangeDutyCycle(speed)
    GPIO.output(BIN2, True)  # BIN2
    GPIO.output(BIN1, False)  # BIN1
    time.sleep(t_time)


def keyscan():
    val = GPIO.input(BtnPin)
    while GPIO.input(BtnPin) == False:
        val = GPIO.input(BtnPin)
    while GPIO.input(BtnPin) == True:
        #        time.sleep(0.01)
        val = GPIO.input(BtnPin)
        if val == True:
            GPIO.output(Rpin, 1)
            while GPIO.input(BtnPin) == False:
                GPIO.output(Rpin, 0)
        else:
            GPIO.output(Rpin, 0)


def setup():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)  # Numbers GPIOs by physical location
    GPIO.setup(Gpin, GPIO.OUT)  # Set Green Led Pin mode to output
    GPIO.setup(Rpin, GPIO.OUT)  # Set Red Led Pin mode to output
    GPIO.setup(BtnPin, GPIO.IN,
               pull_up_down=GPIO.PUD_UP)  # Set BtnPin's mode is input, and pull up to high level(3.3V)
    GPIO.setup(T_SensorRight, GPIO.IN)
    GPIO.setup(T_SensorLeft, GPIO.IN)

    GPIO.setup(AIN2, GPIO.OUT)
    GPIO.setup(AIN1, GPIO.OUT)
    GPIO.setup(PWMA, GPIO.OUT)

    GPIO.setup(BIN1, GPIO.OUT)
    GPIO.setup(BIN2, GPIO.OUT)
    GPIO.setup(PWMB, GPIO.OUT)

def car_move(current_app):
    current_app.logger.debug("Starting!")
    global L_Motor, R_Motor, nodes, index, status
    # KubeEdge node config file
    read_config()
    setup()
    keyscan()
    L_Motor = GPIO.PWM(PWMA, 100)
    L_Motor.start(0)
    R_Motor = GPIO.PWM(PWMB, 100)
    R_Motor.start(0)
    try:
        while True:
            SR = GPIO.input(T_SensorRight)
            SL = GPIO.input(T_SensorLeft)
            if SL == False and SR == False:
                #current_app.logger.info("t_up, SL: %s, SR: %s" %(SL, SR))
                t_up(40, 0)
                status = 1
            elif SL == False and SR == True:
                #current_app.logger.info("Left, SL: %s, SR: %s" %(SL, SR))
                t_left(40, 0)
                status = 1
            elif SL == True and SR == False:
                #current_app.logger.info("Right, SL: %s, SR: %s" %(SL, SR))
                t_right(40, 0)
                status = 1
            else:
                while True:
                    current_app.logger.info("Stop %s sec, SL: %s, SR: %s" % (pause_time, SL, SR))
                    status = 0
                    resUrl = os.path.join(url, nodes[index % len(nodes)])
                    current_app.logger.info(resUrl)
                    response = requests.get(resUrl)
                    current_app.logger.info(response.text)
                    t_stop(pause_time)
                    # Control start or stop according to KubeEdge node status
                    if json.loads(response.text).get('status') == 0:
                        current_app.logger.info("%s is Ready. Continue to go." % (nodes[index%len(nodes)]))
                        break;
                    current_app.logger.info("%s is NotReady. Stop %s sec..." % (nodes[index%len(nodes)], pause_time))
                t_up(40, 0.3)
                index = index + 1

    except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
        GPIO.cleanup()

