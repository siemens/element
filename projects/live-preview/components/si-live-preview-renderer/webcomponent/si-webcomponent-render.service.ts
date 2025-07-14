/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  OnDestroy,
  OutputRefSubscription,
  reflectComponentType
} from '@angular/core';

import { SiLivePreviewWebComponent } from './si-live-preview-web.component';
import { SiLivePreviewWebComponentService } from './si-live-webcomponent.service';

@Injectable({ providedIn: 'root' })
export class SiWebComponentRenderService
  extends SiLivePreviewWebComponentService
  implements OnDestroy
{
  private componentRef!: ComponentRef<SiLivePreviewWebComponent>;
  private componentMirror = reflectComponentType(SiLivePreviewWebComponent);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private environmentInjector = inject(EnvironmentInjector);
  private outputSubscription: OutputRefSubscription | null = null;

  injectComponent(element: ElementRef, inputs: any, outputs: any): void {
    this.destroyComponent();
    this.componentRef = createComponent(SiLivePreviewWebComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });

    this.componentMirror?.inputs.forEach(value => {
      this.componentRef.setInput(value.propName, inputs[value.propName]);
    });

    this.outputSubscription = this.componentRef.instance.inProgress.subscribe(event => {
      outputs.inProgress('progress', event);
    });

    this.appRef.attachView(this.componentRef.hostView);
    element.nativeElement.appendChild(this.componentRef.location.nativeElement);
  }

  destroyComponent(): void {
    this.componentRef?.destroy();
  }

  ngOnDestroy(): void {
    this.outputSubscription?.unsubscribe();
    this.outputSubscription = null;
  }
}
