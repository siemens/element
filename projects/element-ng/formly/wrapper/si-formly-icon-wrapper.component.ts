/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-icon-wrapper',
  imports: [SiTooltipDirective, SiTranslateModule],
  templateUrl: './si-formly-icon-wrapper.component.html',
  styleUrl: './si-formly-icon-wrapper.component.scss'
})
export class SiFormlyIconWrapperComponent extends FieldWrapper {}
