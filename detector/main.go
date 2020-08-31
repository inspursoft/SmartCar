package main

import (
	restful "github.com/emicklei/go-restful"
	restfulspec "github.com/emicklei/go-restful-openapi"
	"github.com/go-openapi/spec"
	"log"
	"net/http"
	"open.inspur.com/TechnologyCenter/Board-BestPractice/SmartCar/detector/service"
)

var (
	VERSION = "0.0.0"
)

func init() {
	ws := new(restful.WebService)
	ws.Path("/api/v1").Consumes(restful.MIME_JSON).Produces(restful.MIME_JSON)
	ns := service.NodeService{}
	ns.InstallRoutes(ws)
	restful.DefaultContainer.Add(ws)
}

func enrichSwaggerObject(swo *spec.Swagger) {
	swo.Info = &spec.Info{
		InfoProps: spec.InfoProps{
			Title:       "DetectorService",
			Description: "Detector Service for SmartCar Nodes",
			Contact: &spec.ContactInfo{
				ContactInfoProps: spec.ContactInfoProps{
					Name:  "zhanghu",
					Email: "zhanghu01@inspur.com",
				},
			},
			License: &spec.License{
				LicenseProps: spec.LicenseProps{
					Name: "MIT",
					URL:  "http://mit.org",
				},
			},
			Version: "1.0.0",
		},
	}
	swo.Tags = []spec.Tag{spec.Tag{TagProps: spec.TagProps{
		Name:        "SmartCar",
		Description: "Managing SmartCar Nodes"}}}
}

func main() {
	log.Printf("start detector %s\n", VERSION)
	config := restfulspec.Config{
		WebServices:                   restful.RegisteredWebServices(), // you control what services are visible
		APIPath:                       "/apidocs.yaml",
		PostBuildSwaggerObjectHandler: enrichSwaggerObject}
	restful.DefaultContainer.Add(restfulspec.NewOpenAPIService(config))

	log.Printf("start listening on localhost:8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
