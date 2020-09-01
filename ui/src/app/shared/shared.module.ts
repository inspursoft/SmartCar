import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { DialogComponent } from './dialog/dialog.component';
import { AlertComponent } from './alert/alert.component';
import { GlobalAlertComponent } from './global-alert/global-alert.component';
import { MessageService } from './message.service';
import { WebsocketService } from './websocket.service';
import { HttpInterceptorService } from './http-client-interceptor';
import { CustomHttpProvider } from './model-http-client';
import { UiComponentLibraryModule } from 'my-ui-component-library';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,
    UiComponentLibraryModule
  ],
  declarations: [
    DialogComponent,
    AlertComponent,
    GlobalAlertComponent
  ],
  providers: [
    MessageService,
    WebsocketService,
    CustomHttpProvider,
    HttpInterceptorService,
  ],
  entryComponents: [
    DialogComponent,
    AlertComponent,
    GlobalAlertComponent
  ]
})
export class SharedModule {

}
