# Tracking Program

This is a program for car tracking.

## Configurate
Edit config/tracking.config
```
[Nodes]
node is set to the KubeEdge node name, separated by comma
pause_time is set to the duration of the car pause on the notready node 
[API]
URL is set to the API that can get node status

e.g.
[Nodes]
node = raspi-node-1,raspi-node-2,board-desktop
pause_time = 5
[API]
URL = http://192.168.0.1:30425/api/v1/nodes/
```

## Run
```
bash tracking/start.sh
```
Then you can get the information of car, such as index of node, car position, whether the car is moving
```
root@master:~# curl ${your_ip_of_the_car}:${flask_port}/api/v1/position
{
  "index": 2, 
  "position": "board-desktop", 
  "status": 1
}
```
ps: you can change flask configuration in tracking/start.sh
