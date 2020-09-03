import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpBase, ResponsePaginationBase } from './model-types';
import { Type } from '@angular/core';

export class ModelHttpClient extends HttpClient {
  defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Content-Security-Policy': 'upgrade-insecure-requests;',
    Authorization: ` Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImdKSURPN29HU` +
      `TZudm5OWDF3Z25LTXFDeG5vbEpLZWVPNmlNWEdXaHlvdTQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL` +
      `3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJ` +
      `rdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhdH` +
      `RhY2hkZXRhY2gtY29udHJvbGxlci10b2tlbi03Z2hnciIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY29` +
      `1bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJhdHRhY2hkZXRhY2gtY29udHJvbGxlciIsImt1YmVybm` +
      `V0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImUyNmEyZjI2LTEzNGUtNG` +
      `UxMS1iMDQ5LTA5NmY5YTMxNmFhNSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3R` +
      `lbTphdHRhY2hkZXRhY2gtY29udHJvbGxlciJ9.kNIN5XMo8FTPp_nnfm44AvS-iB-E0rAJ5BHaKk_f8HTa` +
      `4Dl-6f-AvV12i7O6Le01mE7bLcXzqXaF4WEcMd2F14QwjAKEclDFTtq2rpEUTXHhjzUF15XbzQm5MC_2DgG` +
      `gh-A5A6kFGC7pxuAozED3N7scrq3f4AXKO_tJuzD1lukJmnl2aJ-VBS6cEv0UsqwCgp1Xy1FW71A_5u_NpZv` +
      `PIJuUSOp4ybuMEgOJmVw3YPwCYoB6hMZ535UA1wOYOIxQgHBPo-A1sxt1tckSjH83e4m1cjgpAurL28GOOuB1I` +
      `wqVlvlaxxWIaTBc4qItYrJmLIPvJtibuv7JiZUjKpKMyg`
  });

  constructor(handler: HttpHandler) {
    super(handler);
  }

  getJson(url: string, returnType: Type<HttpBase>, options?: {
    param?: { [param: string]: string },
    header?: HttpHeaders
  }): Observable<any> {
    return super.get(url, {
      observe: 'body',
      responseType: 'json',
      params: options && options.param ? options.param : null,
      headers: options && options.header ? options.header : this.defaultHeaders
    }).pipe(map((res: object) => {
      const returnItem = new returnType(res);
      returnItem.initFromRes();
      return returnItem;
    }));
  }

  postJson(url: string, returnType: Type<HttpBase>, body: any | null, options?: {
    param?: { [param: string]: string },
    header?: HttpHeaders
  }): Observable<any> {
    return super.post(url, body, {
      observe: 'body',
      responseType: 'json',
      params: options && options.param ? options.param : null,
      headers: options && options.header ? options.header : this.defaultHeaders
    }).pipe(map((res: object) => {
      const returnItem = new returnType(res);
      returnItem.initFromRes();
      return returnItem;
    }));
  }

  getPagination(url: string, paginationType: Type<ResponsePaginationBase<HttpBase>>, options?: {
    param?: { [param: string]: string },
    header?: HttpHeaders
  }): Observable<any> {
    return super.get(url, {
        observe: 'body', responseType: 'json',
        params: options && options.param ? options.param : null,
        headers: options && options.header ? options.header : this.defaultHeaders
      }
    ).pipe(map((res: object) => new paginationType(res)));
  }

  getArray(url: string, itemType: Type<HttpBase>, options?: {
    param?: { [param: string]: string },
    header?: HttpHeaders
  }): Observable<any> {
    return super.get(url, {
      observe: 'body',
      responseType: 'json',
      params: options && options.param ? options.param : null,
      headers: options && options.header ? options.header : this.defaultHeaders
    }).pipe(map((res: Array<object>) => {
      const result = Array<HttpBase>();
      if (res && res.length > 0) {
        res.forEach(item => {
          const newItem = new itemType(item);
          newItem.initFromRes();
          result.push(newItem);
        });
      }
      return result;
    }));
  }
}

export function CustomHttpFactory(handler: HttpHandler): ModelHttpClient {
  return new ModelHttpClient(handler);
}

export const CustomHttpProvider = {
  provide: ModelHttpClient,
  useFactory: CustomHttpFactory,
  deps: [HttpHandler]
};
