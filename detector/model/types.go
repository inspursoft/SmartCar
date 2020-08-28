package model

import ()

type NodeStatus int

const (
	NodeStatusReady NodeStatus = iota
	NodeStatusNotReady
	NodeStatusNotExist
	NodeStatusUnknown
)

type Node struct {
	Name    string     `json:"name" description:"name of the node"`
	Status  NodeStatus `json:"status" description:"status of the node"`
	Message string     `json:"message" description:"detail message about the node status"`
}
