# bluetooth tools introduction

## bt-pan

Bluetooth Personal Area Network (PAN) client/server setup script. It can help you to establish a bluetooth PAN as network interface.  
More details please visit https://github.com/mk-fg/fgtk#bt-pan.  
The code is forking from https://github.com/mk-fg/fgtk/blob/master/bt-pan.  
You can establish a interface with ip address like this:  
```
5: bnep0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 1000
    link/ether b8:27:eb:bc:38:17 brd ff:ff:ff:ff:ff:ff
    inet 10.52.181.142/24 brd 10.52.181.255 scope global bnep0
       valid_lft forever preferred_lft forever
    inet6 fe80::ba27:ebff:febc:3817/64 scope link 
       valid_lft forever preferred_lft forever
```

## bt-pan.service

A custom *systemd service* to manage bt-pan. Please set it to PowerBoot.  
You can edit the file according to the actual situation.  
```
[Unit]
...
After=bluetooth.service   # Start after the bluetooth module is started

[Service]
...
Environment="SERVER_MAC=B8:27:EB:EA:C4:A2"  # Bluetooth Personal Area Network (PAN) server MAC 
ExecStart=/usr/local/bin/bt-pan --debug --system client ${SERVER_MAC} # Copy the bt-pan script to /usr/local/bin or change the path to where the script is
ExecStop=/usr/local/bin/bt-pan --debug client ${SERVER_MAC} -d 
...

[Install]
...

```

## monitor.sh

A custom bash script to monitor the interface *bnep0* created by bt-pan by default.  
When just boot up, reboot or disconnect bluetooth network, the interface *bnep0* fails. At this point, the script will works and restart *bt-pan service*.  
If your interface name is not *bnep0*, please edit it.

## monitor.service

A custom *systemd service* to manage monitor.sh. Please set it to PowerBoot.  
You can edit the file according to the actual situation.  
```
[Unit]
Description=monitor
After=bluetooth.service bt-pan.service    # Start after the bluetooth and bt-pan module is started

[Service]
Type=simple
PIDFile=/run/monitor.pid
ExecStart=/opt/shell/monitor.sh   # The path where the monitor.sh is
...

[Install]
...

```

# required dependencies 

* apt install python python-dev python-pip bluetooth bluez pulseaudio-module-bluetooth libsystemd-dev 
* pip install systemd

# steps

**1. Set up a Bluetooth PAN server. (Use bt-pan or blueman on raspberry pi desktop)**  
**2. Pair client and server by `bluetoothctl` like this.**  

```
$ sudo bluetoothctl
[bluetooth]# power on
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# scan on
[NEW] Device XX:XX:XX:XX:XX:XX SERVER MAC
[bluetooth]# scan off
[bluetooth]# trust XX:XX:XX:XX:XX:XX
[bluetooth]# pair XX:XX:XX:XX:XX:XX
Attempting to pair with XX:XX:XX:XX:XX:XX
[CHG] Device XX:XX:XX:XX:XX:XX Connected: yes
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX UUIDs: ... 
[CHG] Device XX:XX:XX:XX:XX:XX Paired: yes
Pairing successful
```

**3. Start bt-pan and monitor**  

```
cp bt-pan.service monitor.service /lib/systemd/system
mkdir -p /opt/shell
cp monitor.sh /opt/shell
cp bt-pan /usr/local/bin
systemctl daemon-reload
systemctl start bt-pan
systemctl start monitor
```

**4. Set PowerBoot**  

```
systemctl enable bt-pan
systemctl enable monitor
```

# Some references 
1. [Failed to connect: org.bluez.Error.Failed](https://unix.stackexchange.com/questions/258074/error-when-trying-to-connect-to-bluetooth-speaker-org-bluez-error-failed)
2. [Bluetooth Network](https://elinux.org/Bluetooth_Network)
3. [Bluetooth connection](https://superuser.com/questions/1062962/can-i-see-my-bluetooth-connection-as-network-interface-in-linux)
4. [Sharing internet by Bluetooth](https://www.raspberrypi.org/forums/viewtopic.php?t=223029)
5. [Systemd manual(en)](https://www.freedesktop.org/software/systemd/man/systemd.unit.html)
6. [Systemd 手册(中文)](http://www.jinbuguo.com/systemd/systemd.service.html)

