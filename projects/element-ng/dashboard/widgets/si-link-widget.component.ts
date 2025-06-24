/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, computed, input } from '@angular/core';
import { addIcons, SiIconNextComponent, elementRight2 } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseComponent } from './si-widget-base.component';
/**
 * The `<si-link-widget>` supports an easy composition of links and actions
 * with support for skeleton loading indicator.
 */
@Component({
  selector: 'si-link-widget',
  imports: [SiIconNextComponent, SiLinkDirective, SiTranslateModule],
  templateUrl: './si-link-widget.component.html',
  host: { class: 'si-link-widget' }
})
export class SiLinkWidgetComponent extends SiWidgetBaseComponent<Link[]> {
  /**
   * Option to enable trailing link arrow icons for each link.
   *
   * @defaultValue false
   */
  readonly showLinkIcons = input(false, { transform: booleanAttribute });
  /**
   * The number of skeleton progress indication rows.
   *
   * @defaultValue 3
   */
  readonly numberOfLinks = input(3);

  protected readonly ghosts = computed(() => new Array(this.numberOfLinks() ?? 3));

  protected readonly icons = addIcons({ elementRight2 });
}
