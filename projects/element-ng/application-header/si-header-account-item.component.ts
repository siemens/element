/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, input, viewChild } from '@angular/core';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipService } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiHeaderActionIconItemBase } from './si-header-action-item-icon-base.directive';

/** Adds an account item to the header. Should be located inside `.header-actions`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-header-account-item]',
  imports: [SiAvatarComponent, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-header-account-item.component.html',
  styleUrl: './si-header-account-item.component.scss',
  providers: [SiTooltipService],
  host: {
    class: 'header-item focus-inside px-4 py-0',
    '[class.dropdown-toggle]': '!!dropdownTrigger'
  }
})
export class SiHeaderAccountItemComponent extends SiHeaderActionIconItemBase {
  protected readonly itemTitle = viewChild.required('itemTitle', { read: ElementRef });
  /** Name of the account. */
  readonly name = input.required<string>();
  /** Initials of the account. If not provided, they will be calculated. */
  readonly initials = input<string>();
  /** URL to an image which should be shown instead of the initials. */
  readonly imageUrl = input<string>();
  /**
   * Accessible label for the account item.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_APPLICATION_HEADER.ACCOUNT:Show account settings for {{name}}`)
   * ```
   */
  readonly accountItemLabel = input(
    t(() => $localize`:@@SI_APPLICATION_HEADER.ACCOUNT:Show account settings for {{name}}`)
  );
}
