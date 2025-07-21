/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EXAMPLE_ROUTE_MAP } from '../interfaces/live-preview-config';

@Component({
  selector: 'si-dummy',
  imports: [NgComponentOutlet],
  standalone: true,
  template: `
    @if (component) {
      <ng-container [ngComponentOutlet]="component" />
    } @else {
      <div class="ion-padding"> Content with path '{{ path }}'</div>
    }
  `
})
export class SiDummyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeMap = inject(EXAMPLE_ROUTE_MAP, { optional: true }) ?? {};

  get path(): string {
    return this.route.pathFromRoot
      .map(r => r.routeConfig?.path)
      .filter(path => path && path !== '**' && path !== '' && path !== 'iframe')
      .join('/');
  }

  get component(): any {
    const lastSegment = this.path.split('/').pop() ?? '';
    return this.routeMap[this.path] ?? this.routeMap[lastSegment] ?? this.routeMap[''];
  }
}
