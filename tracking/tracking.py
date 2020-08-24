#!/usr/bin/python  
# coding=utf-8  
#本段代码实现树莓派智能小车的红外避障效果
#代码使用的树莓派GPIO是用的BOARD编码方式。 
import RPi.GPIO as GPIO  
import time  
import sys 
from threading import Thread
from kubernetes import client, config
import configparser

# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()

T_SensorRight = 26
T_SensorLeft  = 13

PWMA   = 18
AIN1   = 22
AIN2   = 27

PWMB   = 23
BIN1   = 25
BIN2   = 24

BtnPin  = 19
Gpin    = 5
Rpin    = 6

SR = False
SL = False

def read_config(path):
    cf = configparser.ConfigParser()
    cf.read(path)
    options = cf.get("Nodes", "node")
    return options.split(",")

def get_node_status(name):
    v1 = client.CoreV1Api()
    ret = v1.list_node(watch=False)
    for i in ret.items:
        if i.metadata.name == name:
            for j in i.status.conditions:
                if j.type == 'Ready':
                    return j.status == 'True'
    return False


def t_up(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,True) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,True) #BIN1
        time.sleep(t_time)
        
def t_stop(t_time):
        L_Motor.ChangeDutyCycle(0)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(0)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)
        
def t_down(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,True)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,True)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)

def t_left(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,True)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,True) #BIN1
        time.sleep(t_time)

def t_right(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,True) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,True)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)
        
def keyscan():
    val = GPIO.input(BtnPin)
    while GPIO.input(BtnPin) == False:
        val = GPIO.input(BtnPin)
    while GPIO.input(BtnPin) == True:
#        time.sleep(0.01)
        val = GPIO.input(BtnPin)
        if val == True:
            GPIO.output(Rpin,1)
            while GPIO.input(BtnPin) == False:
                GPIO.output(Rpin,0)
        else:
            GPIO.output(Rpin,0)
            
def setup():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)       # Numbers GPIOs by physical location
    GPIO.setup(Gpin, GPIO.OUT)     # Set Green Led Pin mode to output
    GPIO.setup(Rpin, GPIO.OUT)     # Set Red Led Pin mode to output
    GPIO.setup(BtnPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)    # Set BtnPin's mode is input, and pull up to high level(3.3V) 
    GPIO.setup(T_SensorRight,GPIO.IN)
    GPIO.setup(T_SensorLeft,GPIO.IN)
	
    GPIO.setup(AIN2,GPIO.OUT)
    GPIO.setup(AIN1,GPIO.OUT)
    GPIO.setup(PWMA,GPIO.OUT)

    GPIO.setup(BIN1,GPIO.OUT)
    GPIO.setup(BIN2,GPIO.OUT)
    GPIO.setup(PWMB,GPIO.OUT)

def task():
	global SR, SL, SM
	try:
		while True:
			SR = GPIO.input(T_SensorRight)
			SL = GPIO.input(T_SensorLeft)
	except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
		GPIO.cleanup()

if __name__ == '__main__':
    setup()
    keyscan()
    Thread(target=task).start()
    L_Motor= GPIO.PWM(PWMA,100)
    L_Motor.start(0)
    R_Motor = GPIO.PWM(PWMB,100)
    R_Motor.start(0)
# KubeEdge config file
#    options = read_config("./tracking.ini")
    index = 0
    try:
        while True:
#            SR = GPIO.input(T_SensorRight)
#            SL = GPIO.input(T_SensorLeft)
            if SL == False and SR == False:
#                print("t_up, SL: %s, SR: %s" %(SL, SR))
                t_up(40,0)
            elif SL == False and SR == True:
#                print("Left, SL: %s, SR: %s" %(SL, SR))
                t_left(40,0)
            elif SL == True and SR == False:
#                print("Right, SL: %s, SR: %s" %(SL, SR))
                t_right(40,0)
            else:
                while True:
#                    print("Stop 5 sec, SL: %s, SR: %s" %(SL, SR))
                    t_stop(5)
## Control start or stop according to KubeEdge node status
#                    if get_node_status(options[index%len(options)]):
#                        print("%s is Ready. Continue to go." % (options[index%len(options)]))
#                        break;
#                    print("%s is NotReady. Stop 5 sec..." % (options[index%len(options)]))
#                t_up(40,0.3)
#                index = index + 1
##    
    except KeyboardInterrupt:  # When 'Ctrl+C' is pressed, the child program destroy() will be  executed.
        GPIO.cleanup()
