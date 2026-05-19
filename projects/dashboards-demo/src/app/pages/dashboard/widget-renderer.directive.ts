/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  isSignal,
  signal,
  TemplateRef,
  ViewContainerRef,
  viewChild
} from '@angular/core';
import { setupWidgetInstance, Widget, WidgetConfig } from '@siemens/dashboards-ng';

@Component({
  selector: 'app-widget-renderer',
  template: '<ng-container #host />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetRendererComponent {
  readonly widgetConfig = input.required<WidgetConfig>();
  readonly widgetDescriptor = input<Widget>();
  readonly footer = signal<TemplateRef<unknown> | undefined>(undefined);

  private readonly host = viewChild.required('host', { read: ViewContainerRef });
  private readonly injector = inject(Injector);
  private readonly envInjector = inject(EnvironmentInjector);

  constructor() {
    effect(() => {
      const config = this.widgetConfig();
      const descriptor = this.widgetDescriptor();
      this.loadWidget(config, descriptor);
    });
  }

  private loadWidget(config: WidgetConfig, descriptor: Widget | undefined): void {
    this.host().clear();
    this.footer.set(undefined);

    if (!descriptor) {
      return;
    }

    setupWidgetInstance(
      descriptor.componentFactory,
      this.host(),
      this.injector,
      this.envInjector
    ).subscribe(widgetRef => {
      if (isSignal(widgetRef.instance.config)) {
        widgetRef.setInput('config', config);
      } else {
        widgetRef.instance.config = config;
      }
      this.footer.set(widgetRef.instance.footer);
    });
  }
}
