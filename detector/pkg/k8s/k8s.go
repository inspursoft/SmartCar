package k8s

import (
	"encoding/json"
	"fmt"
	"k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"log"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/model"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/pkg/cache"
	"os"
)

const (
	DeviceDefaultGroup     = "devices.kubeedge.io"
	DeviceDefaultVersion   = "v1alpha1"
	DeviceDefaultResource  = "devices"
	DeviceDefaultNamespace = "default"
)

// record humidity report time
var humidityCaches *cache.Cache
var deviceCaches *cache.Cache

func init() {
	humidityCaches = cache.NewCache()
	deviceCaches = cache.NewCache()
}

func getGVR() schema.GroupVersionResource {
	group := os.Getenv("GROUP")
	if group == "" {
		group = DeviceDefaultGroup
	}

	version := os.Getenv("VERSION")
	if version == "" {
		version = DeviceDefaultVersion
	}

	resource := os.Getenv("RESOURCE")
	if resource == "" {
		resource = DeviceDefaultResource
	}
	return schema.GroupVersionResource{Group: group, Version: version, Resource: resource}
}

func getResourceNamespace() string {
	namespace := os.Getenv("DeviceNamespace")
	if namespace == "" {
		namespace = DeviceDefaultNamespace
	}
	return namespace
}

func getClient() (*kubernetes.Clientset, error) {
	return getClientFromConfig(os.Getenv("API_URL"), os.Getenv("KUBECONFIG"))
}

func getDynamicClient() (dynamic.Interface, error) {
	return getDynamicClientFromConfig(os.Getenv("API_URL"), os.Getenv("KUBECONFIG"))
}

func getClientFromConfig(apiUrl, kubeconfig string) (*kubernetes.Clientset, error) {
	cfg, err := getRestConfig(apiUrl, kubeconfig)
	if err != nil {
		return nil, err
	}

	c, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("unable to initialize client: %v", err)
	}
	return c, nil
}

func getRestConfig(apiUrl, kubeconfig string) (*rest.Config, error) {
	// Use out of cluster config if the URL or kubeconfig have been specified. Otherwise use incluster config.
	if apiUrl != "" || kubeconfig != "" {
		return clientcmd.BuildConfigFromFlags(apiUrl, kubeconfig)
	}
	return rest.InClusterConfig()
}

func getDynamicClientFromConfig(apiUrl, kubeconfig string) (dynamic.Interface, error) {
	cfg, err := getRestConfig(apiUrl, kubeconfig)
	if err != nil {
		return nil, err
	}
	return dynamic.NewForConfig(cfg)
}

func GetNodeInfo(name string) model.Node {
	c, err := getClient()
	if err != nil {
		return model.Node{name, model.NodeStatusUnknown, fmt.Sprintf("can't connection to kube-apiserver for node %s : %+v", name, err)}
	}
	node, err := c.CoreV1().Nodes().Get(name, metav1.GetOptions{})
	if err != nil {
		if IsNotFoundError(err) {
			return model.Node{name, model.NodeStatusNotExist, fmt.Sprintf("node %s does not exist", name)}
		}
		return model.Node{name, model.NodeStatusUnknown, fmt.Sprintf("can't get node %s information: %+v", name, err)}
	}

	for i := range node.Status.Conditions {
		if node.Status.Conditions[i].Type == v1.NodeReady {
			if node.Status.Conditions[i].Status == v1.ConditionTrue {
				//do nothing
			} else if node.Status.Conditions[i].Status == v1.ConditionFalse {
				log.Printf("the node %s is not ready: %s\n", name, node.Status.Conditions[i].Message)
				return model.Node{name, model.NodeStatusNotReady, node.Status.Conditions[i].Message}
			} else {
				log.Printf("the node %s is unknown: %s\n", name, node.Status.Conditions[i].Message)
				return model.Node{name, model.NodeStatusUnknown, node.Status.Conditions[i].Message}
			}
			break
		}
	}

	// only think about the 1:1 mapping. ignore other conditions....
	resourceNS := getResourceNamespace()
	deviceName, ok := deviceCaches.Get(name)
	if !ok {
		err = initDeviceCaches(getGVR(), resourceNS)
		//only print error
		log.Printf("list devices error: %+v", err)
		deviceName, ok = deviceCaches.Get(name)
		if !ok {
			log.Printf("can't get the device info for node %s\n", name)
			return model.Node{name, model.NodeStatusNotReady, fmt.Sprintf("can't get the device info for node %s\n", name)}
		}
	}

	deviceInfo, err, rmcache := getDeviceInfoByName(getGVR(), resourceNS, deviceName, name)
	if rmcache {
		deviceCaches.Delete(name)
	}
	if err != nil {
		log.Printf("can't get the device(%s/%s %s) info: %+v\n", deviceName, resourceNS, getGVR(), err)
		return model.Node{name, model.NodeStatusNotReady, fmt.Sprintf("%+v", err)}
	}

	for _, t := range deviceInfo.Status.Twins {
		// judge the humidity changes.
		if t.PropertyName == "humidity-status" {
			if t.Reported.Metadata != nil {
				//the first time, we cache it, but we think the values do not changes.
				lastReportTime := t.Reported.Metadata["timestamp"]
				old, changes := humidityCaches.Update(t.PropertyName, lastReportTime)
				if old != "" && changes {
					log.Printf("the deivce humidity-status report time changes: %s\n", lastReportTime)
					return model.Node{name, model.NodeStatusReady, ""}
				} else {
					log.Printf("the deivce humidity-status report time does't change: %s\n", lastReportTime)
					return model.Node{name, model.NodeStatusNotReady, fmt.Sprintf("the deivce humidity-status report time does't change: %s", lastReportTime)}
				}
			}
			log.Printf("can't find the humidity-status report timestamp\n")
			return model.Node{name, model.NodeStatusNotReady, fmt.Sprintf("can't find the humidity-status report timestamp")}
		}
	}
	//can't find the device status humidity information.
	log.Printf("can't find the humidity-status status\n")
	return model.Node{name, model.NodeStatusNotReady, fmt.Sprintf("can't find the humidity-status status")}
}

func initDeviceCaches(gvr schema.GroupVersionResource, namespace string) error {
	c, err := getDynamicClient()
	if err != nil {
		return err
	}
	deviceInfos, err := c.Resource(gvr).Namespace(namespace).List(metav1.ListOptions{})
	if err != nil {
		return err
	}
	for _, deviceInfo := range deviceInfos.Items {
		obj, err := decodeToDevice(&deviceInfo)
		if err != nil {
			log.Printf("unmarshal device error: %+v\n", err)
			continue
		}
		nodes := getDeviceRelateNodes(obj)
		for i := range nodes {
			deviceCaches.Update(nodes[i], obj.Name)
		}
	}
	return nil
}

// the third result indicate us to delete the cache.
func getDeviceInfoByName(gvr schema.GroupVersionResource, namespace, name, nodename string) (*model.Device, error, bool) {
	c, err := getDynamicClient()
	if err != nil {
		return nil, err, false
	}
	deviceInfo, err := c.Resource(gvr).Namespace(namespace).Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, err, IsNotFoundError(err)
	}
	obj, err := decodeToDevice(deviceInfo)
	if err != nil {
		return nil, err, false
	}

	nodes := getDeviceRelateNodes(obj)
	for i := range nodes {
		if nodes[i] == nodename {
			return obj, nil, false
		}
	}
	return nil, fmt.Errorf("the device %s does not match the node %s", name, nodename), true
}

func decodeToDevice(deviceInfo *unstructured.Unstructured) (*model.Device, error) {
	bs, err := deviceInfo.MarshalJSON()
	if err != nil {
		log.Printf("can't marshal device info: %+v\n", err)
		return nil, err
	}

	var obj model.Device
	err = json.Unmarshal(bs, &obj)
	if err != nil {
		log.Printf("can't unmarshal device %s: %+v\n", string(bs), err)
		return nil, err
	}
	return &obj, nil
}

func getDeviceRelateNodes(device *model.Device) []string {
	if device != nil && device.Spec.NodeSelector != nil {
		for _, term := range device.Spec.NodeSelector.NodeSelectorTerms {
			// only think about the label matches.
			for _, expr := range term.MatchExpressions {
				if expr.Key == "kubernetes.io/hostname" && expr.Operator == v1.NodeSelectorOpIn {
					return expr.Values
				}
			}
		}
	}
	return nil
}

func IsNotFoundError(err error) bool {
	return errors.IsNotFound(err)
}
