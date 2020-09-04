import { Injectable } from '@angular/core';
import { ModelHttpClient } from './shared/model-http-client';
import { Observable } from 'rxjs';
import { K8sNodes, DeviceList, Device, DeviceModel } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private http: ModelHttpClient) {

  }

  testK8s(): Observable<K8sNodes> {
    return this.http.getJson(`/api/v1/nodes`, K8sNodes);
  }

  getDeviceList(namespace = 'default', version = 'v1alpha1'): Observable<DeviceList> {
    return this.http.getJson(`/apis/devices.kubeedge.io/${version}/namespaces/${namespace}/devices`, DeviceList);
  }

  getDevice(deviceName = '', namespace = 'default', version = 'v1alpha1'): Observable<Device> {
    return this.http.getJson(`/apis/devices.kubeedge.io/${version}/namespaces/${namespace}/devices/${deviceName}`, Device);
  }

  getDeviceModel(modelName = '', namespace = 'default', version = 'v1alpha1'): Observable<DeviceModel> {
    return this.http.getJson(`/apis/devices.kubeedge.io/${version}/namespaces/${namespace}/devicemodels/${modelName}`, DeviceModel);
  }

  putDevice(device: Device, deviceName = '', namespace = 'default', version = 'v1alpha1'): Observable<any> {
    return this.http.put(
      `/apis/devices.kubeedge.io/${version}/namespaces/${namespace}/devices/${deviceName}`,
      device.getPostBody(),
      {
        headers: this.http.defaultHeaders
      }
    );
  }
}
