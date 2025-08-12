/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @angular-eslint/prefer-output-emitter-ref */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  signal
} from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiTabsetLegacyComponent } from '../si-tabset/index';

/**
 * @deprecated Use the new components from `@siemens/element-ng/tabs` instead.
 * See {@link https://element.siemens.io/components/layout-navigation/tabs/#code}
 * for usage instructions.
 */
@Component({
  selector: 'si-tab-legacy',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel'
  }
})
export class SiTabLegacyComponent implements OnChanges {
  private static idCounter = 0;
  /** Title of the tab item. */
  @Input() heading?: TranslatableString;
  /** Icon of the tab item. */
  @Input() icon?: string;
  /** Alternative name or translation key for icon. Used for A11y. */
  @Input() iconAltText?: TranslatableString;
  /**
   * Additional badge content. A value of
   * - `true` will render a red dot
   * - any string without a `badgeColor` will render a red dot with text
   * - any string with a `badgeColor` will render a normal badge
   */
  @Input() badgeContent?: TranslatableString | boolean;
  /**
   * Background color of the badge.
   * If no color is provided a red dot badge will be rendered.
   */
  @Input() badgeColor?: string;
  /**
   * Disables the tab.
   *
   * @defaultValue false
   */
  @Input({ transform: booleanAttribute }) disabled = false;
  /**
   * Close the current tab.
   *
   * @defaultValue false
   */
  @Input({ transform: booleanAttribute }) closable? = false;
  /** Event emitter to notify when a tab is closed. */
  @Output() readonly closeTriggered = new EventEmitter<SiTabLegacyComponent>();

  /** @internal */
  @HostBinding('id') id = `__si-tab-panel-${SiTabLegacyComponent.idCounter++}`;
  /** @internal */
  @HostBinding('attr.aria-labelledby') tabId = `__si-tab-${SiTabLegacyComponent.idCounter}`;

  @HostBinding('attr.hidden')
  protected get isHidden(): boolean | null {
    return !this.active() ? true : null;
  }

  private parent?: SiTabsetLegacyComponent;

  /** @internal */
  readonly active = signal(false);

  /** @internal */
  registerParent(parent: SiTabsetLegacyComponent): void {
    this.parent = parent;
  }

  ngOnChanges(): void {
    this.parent?.notifyChildrenChanged();
  }
}
