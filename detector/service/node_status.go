package service

import (
	restful "github.com/emicklei/go-restful"
	"log"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/model"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/pkg/k8s"
)

// NodeService is the REST layer to the NodeStatus domain
type NodeService struct{}

// InstallRoutes handle REST requests for NodeStatus resources.
func (ns NodeService) InstallRoutes(ws *restful.WebService) {
	ws.Route(ws.GET("nodes/{node}").To(ns.getNode).
		Doc("get node").
		Param(ws.PathParameter("node", "identifier of the node").DataType("string")).
		Writes(model.Node{}))
}

func (ns NodeService) getNode(request *restful.Request, response *restful.Response) {
	node := request.PathParameter("node")
	log.Printf("get node %s information.", node)
	response.WriteEntity(k8s.GetNodeInfo(node))
}
