/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { SiTooltipDirective } from '@spike-rabbit/element-ng/tooltip';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

@Component({
  selector: 'si-formly-icon-wrapper',
  imports: [SiTooltipDirective, SiTranslatePipe],
  templateUrl: './si-formly-icon-wrapper.component.html',
  styleUrl: './si-formly-icon-wrapper.component.scss'
})
export class SiFormlyIconWrapperComponent extends FieldWrapper {}
