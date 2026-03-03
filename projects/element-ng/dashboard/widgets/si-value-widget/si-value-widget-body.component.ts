/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, OnInit } from '@angular/core';
import { EntityStatusType } from '@siemens/element-ng/common';
import { SiIconComponent, SiStatusIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseDirective } from '../si-widget-base.directive';

/**
 * The body of the `<si-value-widget>`. Useful for compositions.
 */
@Component({
  selector: 'si-value-widget-body',
  imports: [SiIconComponent, SiStatusIconComponent, SiTranslatePipe],
  templateUrl: './si-value-widget-body.component.html'
})
export class SiValueWidgetBodyComponent
  extends SiWidgetBaseDirective<TranslatableString>
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
