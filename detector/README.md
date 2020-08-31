# Detecting Program

This is a program for node status reporting.

## Build

### 1. Build current arch docker image:


```
# compile code
make build
# build images
make container
# push images
make push
```

### 2.Build all arch docker image:


```
# build all arches images
make all
# push all dockerimages
make all-push
```

## Deploy


```
cd charts/detect
#edit the image and tag
vi values.yaml
helm install --name detect .
```