import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { GlobalAlertMessage } from '../shared.types';

@Component({
  templateUrl: './global-alert.component.html',
  styleUrls: ['./global-alert.component.css']
})
export class GlobalAlertComponent implements OnInit {
  isOpenValue = false;
  curMessage: GlobalAlertMessage;
  onCloseEvent: Subject<any>;
  detailModalOpen = false;
  curErrorDetailMsg = '';

  constructor(private changeRef: ChangeDetectorRef) {
    this.onCloseEvent = new Subject<any>();
  }

  ngOnInit(): void {
    this.getErrorDetailMsg();
  }

  get isOpen(): boolean {
    return this.isOpenValue;
  }

  set isOpen(value: boolean) {
    this.isOpenValue = value;
    if (!value) {
      this.onCloseEvent.next();
    }
  }

  getErrorDetailMsg(): void {
    if (this.curMessage.errorObject && this.curMessage.errorObject instanceof HttpErrorResponse) {
      const err = (this.curMessage.errorObject as HttpErrorResponse).error;
      if (typeof err === 'object') {
        if (err instanceof Blob) {
          const reader = new FileReader();
          reader.addEventListener('loadend', () => {
            this.curErrorDetailMsg = reader.result as string;
            this.changeRef.detectChanges();
          });
          reader.readAsText(err);
        } else {
          this.curErrorDetailMsg = err ? err.message : (this.curMessage.errorObject as HttpErrorResponse).message;
        }
      } else {
        this.curErrorDetailMsg = err;
      }
    } else if (this.curMessage.errorObject) {
      this.curErrorDetailMsg = (this.curMessage.errorObject as Error).message;
    }
  }

  public openAlert(message: GlobalAlertMessage): Observable<any> {
    this.curMessage = message;
    this.isOpen = true;
    return this.onCloseEvent.asObservable();
  }
}
