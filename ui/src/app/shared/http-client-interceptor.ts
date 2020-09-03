import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { MessageService } from './message.service';
import { GlobalAlertType } from './shared.types';


@Injectable()
export class HttpClientInterceptor implements HttpInterceptor {

  constructor(private messageService: MessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq: HttpRequest<any> = req.clone({
      headers: req.headers,
      params: req.params
    });
    authReq = authReq.clone({
      params: authReq.params.set('Timestamp', Date.now().toString())
    });
    return next.handle(authReq)
      .pipe(
        timeout(30000),
        catchError((err: HttpErrorResponse | TimeoutError) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status >= 200 && err.status < 300) {
              const res = new HttpResponse({
                body: null,
                headers: err.headers,
                status: err.status,
                statusText: err.statusText,
                url: err.url
              });
              return of(res);
            } else if (err.status === 502) {
              this.messageService.showGlobalMessage('Error 502', {
                globalAlertType: GlobalAlertType.gatShowDetail,
                errorObject: err
              });
            } else if (err.status === 504) {
              this.messageService.showGlobalMessage('Error 504', {
                globalAlertType: GlobalAlertType.gatShowDetail,
                errorObject: err
              });
            } else if (err.status === 500) {
              this.messageService.showGlobalMessage('Error 500', {
                globalAlertType: GlobalAlertType.gatShowDetail,
                errorObject: err
              });
            } else if (err.status === 400) {
              this.messageService.showGlobalMessage(`Error 400`, {
                globalAlertType: GlobalAlertType.gatShowDetail,
                errorObject: err
              });
            } else if (err.status === 401) {
              this.messageService.showGlobalMessage(`Error 401`, {
                globalAlertType: GlobalAlertType.gatLogin,
                alertType: 'warning'
              });
            } else if (err.status === 403) {
              this.messageService.showAlert(`Error 403`, {alertType: 'danger'});
            } else if (err.status === 404) {
              this.messageService.showAlert(`Error 404`, {alertType: 'warning'});
            } else if (err.status === 412) {
              this.messageService.showAlert(`Error 412`, {alertType: 'warning'});
            } else if (err.status === 422) {
                this.messageService.showAlert(`Error 422`, {alertType: 'danger'});
            } else {
              this.messageService.showGlobalMessage(`Unknown Error`, {
                globalAlertType: GlobalAlertType.gatShowDetail,
                errorObject: err
              });
            }
          } else {
            this.messageService.showGlobalMessage(`ERROR.HTTP_TIME_OUT`, {
              globalAlertType: GlobalAlertType.gatShowDetail,
              errorObject: err,
              endMessage: req.url
            });
          }
          return throwError(err);
        }));
  }
}

export const HttpInterceptorService = {
  provide: HTTP_INTERCEPTORS,
  useClass: HttpClientInterceptor,
  deps: [MessageService],
  multi: true
};
