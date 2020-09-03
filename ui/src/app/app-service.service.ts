import { Injectable } from '@angular/core';
import { ModelHttpClient } from './shared/model-http-client';
import { Observable } from 'rxjs';
import { K8sNodes } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private http: ModelHttpClient) {

  }

  testK8s(): Observable<K8sNodes> {
    return this.http.getJson(`/api/v1/nodes`, K8sNodes);
  }
}
