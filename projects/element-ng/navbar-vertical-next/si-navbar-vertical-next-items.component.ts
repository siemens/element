/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Content slot for navbar items inside `si-navbar-vertical-next`.
 * Place `<a si-navbar-vertical-next-item>` and `<button si-navbar-vertical-next-item>` elements inside this component.
 * @experimental
 */
@Component({
  selector: 'si-navbar-vertical-next-items',
  template: '<ng-content />',
  styleUrl: './si-navbar-vertical-next-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiNavbarVerticalNextItemsComponent {}
