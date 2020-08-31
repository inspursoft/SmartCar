package k8s

import (
	"fmt"
	"k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"log"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/model"
	"os"
)

func getClient() (*kubernetes.Clientset, error) {
	return getClientFromConfig(os.Getenv("API_URL"), os.Getenv("KUBECONFIG"))
}

func getClientFromConfig(apiUrl, kubeconfig string) (*kubernetes.Clientset, error) {
	var cfg *rest.Config
	var err error
	// Use out of cluster config if the URL or kubeconfig have been specified. Otherwise use incluster config.
	if apiUrl != "" || kubeconfig != "" {
		cfg, err = clientcmd.BuildConfigFromFlags(apiUrl, kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("unable to create k8s config: %v", err)
		}
	} else {
		cfg, err = rest.InClusterConfig()
		if err != nil {
			return nil, fmt.Errorf("unable to initialize inclusterconfig: %v", err)
		}
	}

	c, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("unable to initialize client: %v", err)
	}
	return c, nil
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
				log.Printf("the node %s is not ready: %s", name, node.Status.Conditions[i].Message)
				return model.Node{name, model.NodeStatusNotReady, node.Status.Conditions[i].Message}
			} else {
				log.Printf("the node %s is unknown: %s", name, node.Status.Conditions[i].Message)
				return model.Node{name, model.NodeStatusUnknown, node.Status.Conditions[i].Message}
			}
			break
		}
	}
	//TODO: check the device metric upload status for the node
	return model.Node{name, model.NodeStatusReady, ""}

}

func IsNotFoundError(err error) bool {
	return errors.IsNotFound(err)
}
