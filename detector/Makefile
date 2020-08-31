.PHONY: all push container clean orphan all-push push-manifest

include ./Makefile.manifest

REGISTRY ?= piranhahu
IMAGE = $(REGISTRY)/detector
IMAGE_WITH_ARCH = $(IMAGE)-$(ARCH)

TAG = 1.0
REV = $(shell git describe --contains --always --match='v*')

# Architectures supported: amd64, arm, arm64, ppc64le and s390x
ARCH ?= amd64

ALL_ARCH = amd64 arm arm64 ppc64le s390x
OS = linux

LDFLAGS   := -X main.VERSION=$(REV) -w -s -extldflags "-static"
CROSS_IMAGE ?= golang
CROSS_VERSION ?= 1.15.0

GOPKG = open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector
BIN = detector

# If you want to build AND push all containers, see the 'all-push' rule.
all: all-container

all-push: all-push-images push-manifest

push-manifest: manifest-tool
	manifest-tool push from-args --platforms $(call join_platforms,$(ALL_ARCH)) --template $(IMAGE)-ARCH:$(TAG) --target $(IMAGE):$(TAG)

sub-container-%:
	$(MAKE) ARCH=$* container

sub-push-%:
	$(MAKE) ARCH=$* push

all-container: $(addprefix sub-container-,$(ALL_ARCH))

all-push-images: $(addprefix sub-push-,$(ALL_ARCH))

build: bin/$(BIN)-$(ARCH)

bin/$(BIN)-$(ARCH):
	mkdir -p bin
	docker run --rm -v $$(pwd):/usr/src/$(GOPKG) -w /usr/src/$(GOPKG) \
		-e GOOS=$(OS)  -e GOARCH=$(ARCH) -e CGO_ENABLED=0 \
		$(CROSS_IMAGE):$(CROSS_VERSION) \
		go build -v -ldflags '$(LDFLAGS)' -o bin/$(BIN)-$(ARCH)

container: .container-$(ARCH)
.container-$(ARCH): bin/$(BIN)-$(ARCH)
	docker build -t $(IMAGE_WITH_ARCH):$(TAG) --build-arg ARCH=$(ARCH) -f build/Dockerfile .
	touch $@

push: .push-$(ARCH)
.push-$(ARCH): .container-$(ARCH)
	docker push $(IMAGE_WITH_ARCH):$(TAG)
	touch $@

clean:
	rm -rf .container-* .push-* bin/
