# SmartCar Sensors
There are several sensors on the inspection car. In the project, use the kubernetes device model to define the data struct of each type of sensors. 
Then deploy a device instance for each sensor based on the device models and get the sensor data by kubernetes

Deploy the device model on k8s:

```
#kubectl create -f warningled-model.yaml
```

Check the device model
```
[root@192 crds]# kubectl get devicemodel warningled-model -o yaml
apiVersion: devices.kubeedge.io/v1alpha1
kind: DeviceModel
metadata:
  creationTimestamp: "2020-09-07T07:38:23Z"
  generation: 1
  managedFields:
  - apiVersion: devices.kubeedge.io/v1alpha1
    fieldsType: FieldsV1
    fieldsV1:
      f:spec:
        .: {}
        f:properties: {}
    manager: kubectl
    operation: Update
    time: "2020-09-07T07:38:23Z"
  name: warningled-model
  namespace: default
  resourceVersion: "7879238"
  selfLink: /apis/devices.kubeedge.io/v1alpha1/namespaces/default/devicemodels/warningled-model
  uid: 62d19d67-c4af-4177-8b7c-1ecfe62277ca
spec:
  properties:
  - description: Warning led status RUNNING (Green) WARNING (Red) OFF (default)
    name: status
    type:
      string:
        accessMode: ReadWrite
        defaultValue: OFF
[root@192 crds]#
```