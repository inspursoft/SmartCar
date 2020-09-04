import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { UiComponentLibraryModule } from 'my-ui-component-library';
import { ClarityModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalParentBaseComponent } from './shared/component-base/modal-parent-base';
import {
  ModalChildBaseComponent,
  ModalChildMessageComponent,
  ModalViewContainerSelectorDirective
} from './shared/component-base/modal-child-base';
import { ComponentBaseComponent } from './shared/component-base/component-base';
import { AppServiceService } from './app-service.service';
import { HttpClientModule } from '@angular/common/http';
import { NodeListComponent } from './node-list/node-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardNewComponent } from './dashboard-new/dashboard-new.component';
import { DeviceComponent } from './device/device.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalViewContainerSelectorDirective,
    ComponentBaseComponent,
    ModalChildBaseComponent,
    ModalChildMessageComponent,
    ModalParentBaseComponent,
    NodeListComponent,
    DashboardComponent,
    DashboardNewComponent,
    DeviceComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ClarityModule,
    UiComponentLibraryModule,
    SharedModule
  ],
  providers: [AppServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
