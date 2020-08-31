###
Node Status Detecting Program for node status reporting.

# Build current arch docker image:


```
# compile code
make build
# build images
make container
# push images
make push
```

# Build all arch docker image:


```
# build all arches images
make all
# push all dockerimages
make all-push
```

# Deploy to kubernetes


```
cd detect
vi values.yaml #edit the image and tag
helm install --name detect .
```