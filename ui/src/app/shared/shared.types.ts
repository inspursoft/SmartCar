import { HttpErrorResponse } from '@angular/common/http';
import { Type } from '@angular/core';
import { TimeoutError } from 'rxjs';

export const DISMISS_ALERT_INTERVAL = 4;

export type AlertType = 'success' | 'danger' | 'info' | 'warning';

export enum ViewContent {
  Collection, Recognition, ManageData
}

export enum MessageReturnStatus {
  rsNone, rsConfirm, rsCancel
}

export enum ButtonStyle {
  Confirmation = 1, Deletion, YesNo, OnlyConfirm
}

export class Message {
  title = '';
  message = '';
  data: any;
  buttonStyle: ButtonStyle = ButtonStyle.Confirmation;
  returnStatus: MessageReturnStatus = MessageReturnStatus.rsNone;
}

export class AlertMessage {
  message = '';
  alertType: AlertType = 'success';
}

export enum GlobalAlertType {
  gatNormal, gatShowDetail, gatLogin
}

export class GlobalAlertMessage {
  type: GlobalAlertType = GlobalAlertType.gatNormal;
  message = '';
  alertType: AlertType = 'danger';
  errorObject: HttpErrorResponse | Type<Error> | TimeoutError;
  endMessage = '';
}

export class Tools {
  static isValidString(str: string, reg?: RegExp): boolean {
    if (str === undefined || str == null || str.trim() === '') {
      return false;
    } else if (reg) {
      return reg.test(str);
    }
    return true;
  }

  static isInvalidString(str: string, reg?: RegExp): boolean {
    return !Tools.isValidString(str, reg);
  }

  static isValidObject(obj: any): boolean {
    return obj !== null && obj !== undefined && typeof obj === 'object';
  }

  static isInvalidObject(obj: any): boolean {
    return !Tools.isValidObject(obj);
  }

  static isValidArray(obj: any): boolean {
    return Array.isArray(obj);
  }

  static isInvalidArray(obj: any): boolean {
    return !Tools.isValidArray(obj);
  }
}
