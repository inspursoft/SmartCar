import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ButtonStyle, Message, MessageReturnStatus } from '../shared.types';

@Component({
  templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnDestroy, AfterViewInit {
  opened: boolean;
  curMessage: Message;
  private returnSubject: Subject<Message>;
  @HostBinding('tabindex') tabIndex = '-1';

  @HostListener('keypress', ['$event']) onKeypress(event: KeyboardEvent): void {
    if ((event.key === 'Enter' || event.code === 'NumpadEnter')
      && this.curMessage.buttonStyle === ButtonStyle.OnlyConfirm) {
      this.curMessage.returnStatus = MessageReturnStatus.rsCancel;
      this.returnSubject.next(this.curMessage);
    }
  }

  constructor(private el: ElementRef) {
    this.curMessage = new Message();
    this.returnSubject = new Subject<Message>();
  }

  ngAfterViewInit(): void {
    (this.el.nativeElement as HTMLElement).focus();
  }

  ngOnDestroy(): void {

  }

  public openDialog(message: Message): Observable<Message> {
    this.curMessage = message;
    this.opened = true;
    return this.returnSubject.asObservable();
  }

  confirm(): void {
    this.opened = false;
    this.curMessage.returnStatus = MessageReturnStatus.rsConfirm;
    this.returnSubject.next(this.curMessage);
  }

  cancel(): void {
    this.opened = false;
    this.curMessage.returnStatus = MessageReturnStatus.rsCancel;
    this.returnSubject.next(this.curMessage);
  }
}
