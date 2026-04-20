/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

/**
 * Content slot for navbar items inside `si-navbar-vertical-next`.
 * Place `<a si-navbar-vertical-next-item>` and `<button si-navbar-vertical-next-item>` elements inside this component.
 * @experimental
 */
@Component({
  selector: 'si-navbar-vertical-items-next',
  template: '<ng-content />',
  styleUrl: './si-navbar-vertical-items-next.component.scss'
})
export class SiNavbarVerticalItemsNextComponent {}
