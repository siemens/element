/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { LocationChangeListener, LocationStrategy } from '@angular/common';

/** A router location that is private to a rendered example application. */
export class ExampleLocationStrategy extends LocationStrategy {
  private currentPath = '/';
  private state: unknown = null;

  path(): string {
    return this.currentPath;
  }

  prepareExternalUrl(internal: string): string {
    return internal;
  }

  getState(): unknown {
    return this.state;
  }

  pushState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.state = state;
    this.currentPath = url + queryParams;
  }

  replaceState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.state = state;
    this.currentPath = url + queryParams;
  }

  forward(): void {}

  back(): void {}

  onPopState(_fn: LocationChangeListener): void {}

  getBaseHref(): string {
    return '';
  }
}
