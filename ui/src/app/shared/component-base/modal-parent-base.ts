import { Component, ComponentFactoryResolver, Type, ViewContainerRef } from '@angular/core';
import { ComponentBaseComponent } from './component-base';
import { ModalChildBaseComponent } from './modal-child-base';

@Component({template: ''})
export class ModalParentBaseComponent extends ComponentBaseComponent {
  constructor(protected factoryResolver?: ComponentFactoryResolver,
              protected selfView?: ViewContainerRef) {
    super();
  }

  createNewModal<T extends ModalChildBaseComponent>(newComponent: Type<T>): T {
    const factory = this.factoryResolver.resolveComponentFactory(newComponent);
    const componentRef = this.selfView.createComponent(factory);
    componentRef.instance.openModal().subscribe();
    return componentRef.instance;
  }
}

