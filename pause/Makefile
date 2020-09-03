.PHONY: all push container clean 

REGISTRY ?= piranhahu
IMAGE = $(REGISTRY)/pause
IMAGE_WITH_ARCH = $(IMAGE)-$(ARCH)

TAG = 3.1
REV = $(shell git describe --contains --always --match='v*')

# Architectures supported: amd64, arm, arm64, ppc64le and s390x
ARCH ?= arm

CFLAGS = -Os -Wall -Werror -static -DVERSION=v$(TAG)-$(REV)

BIN = pause
SRCS = pause.c
TRIPLE ?= arm-linux-gnueabihf

# If you want to build AND push all containers, see the 'all-push' rule.
all: container

build: bin/$(BIN)-$(ARCH)

bin/$(BIN)-$(ARCH): $(SRCS)
	mkdir -p bin
	$(TRIPLE)-gcc $(CFLAGS) -o $@ $^

container: .container-$(ARCH)
.container-$(ARCH): bin/$(BIN)-$(ARCH)
	docker build --pull -t $(IMAGE_WITH_ARCH):$(TAG) --build-arg ARCH=$(ARCH) .
	touch $@

push: .push-$(ARCH)
.push-$(ARCH): .container-$(ARCH)
	docker push $(IMAGE_WITH_ARCH):$(TAG)
	touch $@

clean:
	rm -rf .container-* .push-* bin/
