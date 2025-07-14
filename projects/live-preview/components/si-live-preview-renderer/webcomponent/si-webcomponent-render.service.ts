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
  reflectComponentType
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  private destroyer = new Subject<void>();

  injectComponent(element: ElementRef, inputs: any, outputs: any): void {
    this.destroyComponent();
    this.componentRef = createComponent(SiLivePreviewWebComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });

    this.componentMirror?.inputs.forEach(value => {
      this.componentRef.setInput(value.propName, inputs[value.propName]);
    });
    this.componentRef.instance.inProgress.pipe(takeUntil(this.destroyer)).subscribe(event => {
      outputs.inProgress('progress', event);
    });

    this.appRef.attachView(this.componentRef.hostView);
    element.nativeElement.appendChild(this.componentRef.location.nativeElement);
  }

  destroyComponent(): void {
    this.componentRef?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyer.next();
    this.destroyer.complete();
  }
}
