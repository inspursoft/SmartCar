import { AfterViewInit, Component, Directive, HostBinding, OnDestroy, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ComponentBaseComponent } from './component-base';
import { MessageService } from '../message.service';

@Directive({
  selector: '[appModalViewContainerSelector], .modal-body, .modal-title'
})
export class ModalViewContainerSelectorDirective {
  @HostBinding('tabindex') tabIndex = '-1';

  constructor(public view: ViewContainerRef) {

  }
}

@Component({template: ''})
export class ModalChildBaseComponent extends ComponentBaseComponent implements OnDestroy {
  modalOpenedValue = false;
  @Output() closeNotification: Subject<any>;
  @ViewChild(ModalViewContainerSelectorDirective) alertViewSelector;

  constructor() {
    super();
    this.closeNotification = new Subject<any>();
  }

  get alertView(): ViewContainerRef {
    return this.alertViewSelector.view;
  }

  ngOnDestroy(): void {
    this.closeNotification.next();
  }

  set modalOpened(value: boolean) {
    this.modalOpenedValue = value;
    if (!value) {
      this.closeNotification.next();
    }
  }

  get modalOpened(): boolean {
    return this.modalOpenedValue;
  }

  openModal(): Observable<any> {
    this.modalOpened = true;
    return this.closeNotification.asObservable();
  }
}

@Component({template: ''})
export class ModalChildMessageComponent extends ModalChildBaseComponent implements OnDestroy, AfterViewInit {
  constructor(protected messageService: MessageService) {
    super();
  }

  ngAfterViewInit(): void {
    this.messageService.registerModalDialogHandle(this.alertView);
  }

  ngOnDestroy(): void {
    this.messageService.unregisterModalDialogHandle();
  }
}
