/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { SiFormlyComponent as SiFormlyBaseComponent } from '@siemens/element-ng/formly';

/**
 * @deprecated This component is based on Angular Formly v6 and will be removed in
 * a future release. Migrate to the standalone `SiFormlyComponent` from
 * `@siemens/element-ng/formly` (Formly v7.1) instead.
 */
@Component({
  selector: 'si-formly',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './si-formly.component.html'
})
export class SiFormlyComponent<
  TControl extends { [K in keyof TControl]: AbstractControl }
> extends SiFormlyBaseComponent<TControl> {}
