/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-icon-wrapper',
  imports: [SiIconComponent, SiTooltipDirective, SiTranslatePipe],
  templateUrl: './si-formly-icon-wrapper.component.html',
  styleUrl: './si-formly-icon-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFormlyIconWrapperComponent extends FieldWrapper {}
