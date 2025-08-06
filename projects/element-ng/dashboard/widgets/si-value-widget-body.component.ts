/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, OnInit } from '@angular/core';
import { EntityStatusType } from '@spike-rabbit/element-ng/common';
import { SiIconNextComponent, SiStatusIconComponent } from '@spike-rabbit/element-ng/icon';
import {
  SiTranslateModule,
  TranslatableString
} from '@spike-rabbit/element-translate-ng/translate';

import { SiWidgetBaseComponent } from './si-widget-base.component';

/**
 * The body of the `<si-value-widget>`. Useful for compositions.
 */
@Component({
  selector: 'si-value-widget-body',
  imports: [SiIconNextComponent, SiStatusIconComponent, SiTranslateModule],
  templateUrl: './si-value-widget-body.component.html'
})
export class SiValueWidgetBodyComponent
  extends SiWidgetBaseComponent<TranslatableString>
  implements OnInit
{
  /**
   * The unit of the value (e.g. kWh or users). Only visible if `value` is available.
   */
  readonly unit = input<TranslatableString>();
  /**
   * The element icon name. Only visible if `value` is available.
   */
  readonly icon = input<string>();
  /**
   * Show a status icon instead of the {@link icon}.
   */
  readonly status = input<EntityStatusType>();
  /**
   * Short description of the value. A description is mandatory
   * to show an icon. Only visible if `value` is available.
   */
  readonly description = input<TranslatableString>();
}
