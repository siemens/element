/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Location, LocationStrategy } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ErrorHandler,
  inject,
  Injector
} from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideRouter, Router, withDisabledInitialNavigation } from '@angular/router';

import { LOG_EVENT } from '../../helpers/log-event';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_EXAMPLE_ROUTES
} from '../../interfaces/live-preview-config';
import type { SiLivePreviewProviderConfig } from '../../live-preview.provider';
import { SiDummyComponent } from '../si-dummy.component';
import { ExampleLocationStrategy } from './example-location-strategy';
import { SiLivePreviewRuntimeComponent } from './si-live-preview-runtime.component';

/**
 * Runtime shell that renders each example in an independent Angular application.
 * The example application owns its router and does not modify the live-preview router.
 */
@Directive()
export abstract class SiLivePreviewApplicationRuntimeComponent extends SiLivePreviewRuntimeComponent {
  private readonly applicationConfig = inject(
    SI_LIVE_PREVIEW_CONFIG
  ) as SiLivePreviewProviderConfig;
  private readonly parentInjector = inject(Injector);
  private exampleComponentRef?: ComponentRef<unknown>;
  private applicationRef?: ApplicationRef;
  private hostElement?: HTMLElement;
  private destroyed = false;

  override ngAfterViewInit(): void {
    this.createExampleApplication();
  }

  override ngOnDestroy(): void {
    this.destroyed = true;
    this.exampleComponentRef?.destroy();
    this.exampleComponentRef = undefined;
    this.applicationRef?.destroy();
    this.hostElement?.remove();
  }

  private async createExampleApplication(): Promise<void> {
    try {
      const locationStrategy = new ExampleLocationStrategy();
      const configuredApplication = this.applicationConfig.exampleApplicationConfig;
      const exampleApplicationConfig =
        typeof configuredApplication === 'function'
          ? configuredApplication(this.parentInjector)
          : configuredApplication;
      this.applicationRef = await createApplication({
        ...exampleApplicationConfig,
        providers: [
          ...(exampleApplicationConfig?.providers ?? []),
          provideRouter([], withDisabledInitialNavigation()),
          { provide: LocationStrategy, useValue: locationStrategy },
          {
            provide: Location,
            useFactory: () => new Location(inject(LocationStrategy))
          },
          {
            provide: LOG_EVENT,
            useFactory: () => this.parentInjector.get(LOG_EVENT)
          },
          {
            provide: ErrorHandler,
            useValue: { handleError: (error: unknown) => this.handleError(error) }
          }
        ]
      });

      if (this.destroyed) {
        this.applicationRef.destroy();
        return;
      }

      this.exampleComponentRef = createComponent(this.component(), {
        environmentInjector: this.applicationRef.injector
      });
      this.hostElement = this.exampleComponentRef.location.nativeElement as HTMLElement;
      const anchor = this.container().element.nativeElement as Node;
      anchor.parentNode?.insertBefore(this.hostElement, anchor);
      const exampleRoutes = this.exampleComponentRef.injector.get(
        SI_LIVE_PREVIEW_EXAMPLE_ROUTES,
        this.applicationConfig.defaultRoutes ?? [{ path: '**', component: SiDummyComponent }],
        { self: true }
      );

      this.applicationRef.injector.get(Router).resetConfig(exampleRoutes);
      this.applicationRef.attachView(this.exampleComponentRef.hostView);
      this.applicationRef.tick();
      this.ready.emit();
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    this.renderingError.emit(error instanceof Error ? error : new Error(String(error)));
  }
}
