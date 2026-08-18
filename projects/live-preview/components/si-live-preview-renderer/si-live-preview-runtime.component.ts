/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  DoCheck,
  inject,
  input,
  OnDestroy,
  output,
  Signal,
  Type,
  ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, Routes } from '@angular/router';

import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_EXAMPLE_ROUTES
} from '../../interfaces/live-preview-config';

/**
 * Base class for components that act as a live-preview runtime shell.
 * Extend this class when providing `SiLivePreviewConfig.runtimeComponent`.
 */
@Directive()
export abstract class SiLivePreviewRuntimeComponent implements AfterViewInit, DoCheck, OnDestroy {
  readonly component = input.required<Type<unknown>>();
  readonly ready = output<void>();
  readonly renderingError = output<Error>();

  protected abstract readonly container: Signal<ViewContainerRef>;

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private componentRef?: ComponentRef<unknown>;
  private childRouteBackup: Routes | undefined;
  private hasRenderingError = false;

  ngAfterViewInit(): void {
    this.componentRef = this.container().createComponent(this.component());
    const exampleRoutes =
      this.componentRef.injector.get(SI_LIVE_PREVIEW_EXAMPLE_ROUTES, undefined, {
        optional: true,
        self: true
      }) ??
      this.config.defaultRoutes ??
      this.activatedRoute.routeConfig?.children ??
      [];
    const route = this.activatedRoute.routeConfig;
    if (route) {
      this.childRouteBackup = route.children;
      // Do not reset the router configuration: that destroys child components during navigation.
      route.children = [...exampleRoutes];
    }
    this.ready.emit();
  }

  ngOnDestroy(): void {
    const route = this.activatedRoute.routeConfig;
    if (route) {
      route.children = this.childRouteBackup;
    }
  }

  ngDoCheck(): void {
    if (this.hasRenderingError) {
      return;
    }
    try {
      this.changeDetector.detectChanges();
    } catch (error: unknown) {
      this.hasRenderingError = true;
      this.renderingError.emit(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
