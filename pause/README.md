# Pause Image For Raspberry Pi Zero

This document shows the steps of building pause image for Raspberry Pi Zero.

## Cross-Compiling from x86-64 linux system.

### 1. Preparing for cross-compiling

```
git clone https://github.com/raspberrypi/tools ~/tools
echo PATH=\$PATH:~/tools/arm-bcm2708/arm-linux-gnueabihf/bin >> ~/.bashrc
source ~/.bashrc
```

### 2. Compile pause binary and Build docker image:

```
make
```

## Direct use


```
docker pull piranhahu/pause-arm:3.1
```