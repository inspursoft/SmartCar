import time
import os

import RPi.GPIO as GPIO
import subprocess
import json
import requests

## KubeEdge device index
device = ["temperature-and-humidity-1", "temperature-and-humidity-2"]
index = 0

## Car pause time
pause_time = 2

## URL
HEADERS = {'Content-Type': 'application/json;charset=utf-8'}
url = "http://196.222.222.175:8080/imlpservice/model"

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
LightPin = 21

SR = False
SL = False

def get_device(name):
    cmd = "kubectl --kubeconfig /root/k8s-file/kubeconfig get device " + name + " -o jsonpath=\"{range .status.twins[*]}{.reported.value} {end}\""
    #print(cmd)
    data = subprocess.check_output(cmd, shell=True)
    #print(data)
    datalist = data.split(' ')
    model = {}
    model['temperature'] = datalist[0][:len(datalist[0])-1]
    model['humidity'] = datalist[1][:len(datalist[1])-1]
    model_json = json.dumps([model])
    print(model_json)
    HEADERS = {'Content-Type': 'application/json;charset=utf-8'}
    url = "http://196.222.222.175:8080/imlpservice/model"
    req = requests.post(url=url, headers=HEADERS, data=model_json)
    prediction = json.loads(json.loads(req.text).get('result'))[0].get('prediction(label)')
    print(prediction)
    return prediction

def light_on(t_time):
    GPIO.output(LightPin, GPIO.HIGH)
    time.sleep(t_time)

def light_off():
    GPIO.output(LightPin, False)

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
    GPIO.setup(LightPin, GPIO.OUT)
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

if __name__ == '__main__':
    global L_Motor, R_Motor, status
    setup()
    keyscan()
    L_Motor = GPIO.PWM(PWMA, 100)
    L_Motor.start(0)
    R_Motor = GPIO.PWM(PWMB, 100)
    R_Motor.start(0)
    try:
        while True:
            light_off()
            SR = GPIO.input(T_SensorRight)
            SL = GPIO.input(T_SensorLeft)
            if SL == False and SR == False:
                #print("t_up, SL: %s, SR: %s" %(SL, SR))
                t_up(40, 0)
            elif SL == False and SR == True:
                #print("Left, SL: %s, SR: %s" %(SL, SR))
                t_left(40, 0)
            elif SL == True and SR == False:
                #print("Right, SL: %s, SR: %s" %(SL, SR))
                t_right(40, 0)
            else:
                while True:
                    t_stop(pause_time)
                    # Get KubeEdge device status
                    prediction = get_device(device[index%len(device)])
                    if prediction == "No":
                        print("%s is good. Continue to go." % (device[index%len(device)]))
                        break;
                    elif prediction == "Yes":
                        print("%s is Warning. Stop %s sec..." % (device[index%len(device)], pause_time))
                        light_on(2)
                
                light_off()
                t_up(40, 0.3)
                index = index + 1

    except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
        GPIO.cleanup()

