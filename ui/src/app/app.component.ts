import { AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AppServiceService } from './app-service.service';
import { MessageService } from './shared/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'inspector-vehicle';
  @ViewChild('messageContainer', {read: ViewContainerRef}) messageContainer;

  constructor(private appService: AppServiceService,
              private resolver: ComponentFactoryResolver,
              private messageService: MessageService) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.messageService.registerDialogHandle(this.messageContainer, this.resolver);
  }

}
