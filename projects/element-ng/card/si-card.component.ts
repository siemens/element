/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent,
  ViewType
} from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-card',
  imports: [SiContentActionBarComponent, SiTranslatePipe],
  templateUrl: './si-card.component.html',
  styleUrl: './si-card.component.scss',
  host: {
    class: 'card',
    '[class.card-horizontal]': 'classCardHorizontal()',
    '[style.--si-card-img-object-fit]': 'imgObjectFit()',
    '[style.--si-card-img-object-position]': 'imgObjectPosition()'
  }
})
export class SiCardComponent {
  /**
   * Card header text.
   */
  readonly heading = input<TranslatableString>();
  /**
   * Input list of primary action items. Supports up to **4** actions and omits additional ones.
   *
   * @defaultValue []
   */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /**
   * Input list of secondary action items.
   *
   * @defaultValue []
   */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);
  /**
   * A param that will be passed to the `action` in the primary/secondary actions.
   * This allows to re-use the same primary/secondary action arrays across rows
   * in a table.
   */
  readonly actionParam = input<any>();
  /**
   * The view type of the content action bar of the card. Default is `collapsible`
   * for dashboards. However, in some cases you might need to change to `expanded`
   * or `mobile`.
   *
   * @defaultValue 'collapsible'
   */
  readonly actionBarViewType = input<ViewType>('collapsible');
  /**
   * Optional setting of html title attribute for the content action bar.
   * Helpful for a11y when only one action is configured in expand mode.
   *
   * @defaultValue ''
   */
  readonly actionBarTitle = input<TranslatableString>('');
  /**
   * Image source for the card.
   */
  readonly imgSrc = input<string>();
  /**
   * Alt text for a provided image.
   */
  readonly imgAlt = input<string>();
  /**
   * Defines if an image is placed on top or start (left) of the card.
   *
   * @defaultValue 'vertical'
   */
  readonly imgDir = input<('horizontal' | 'vertical') | undefined>('vertical');
  /**
   * Sets the image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property,
   * Sets the image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property.
   *
   * @defaultValue 'scale-down'
   */
  readonly imgObjectFit = input<('contain' | 'cover' | 'fill' | 'none' | 'scale-down') | undefined>(
    'scale-down'
  );
  /**
   * Sets the image [object-position](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) CSS property.
   */
  readonly imgObjectPosition = input<string>();
  /**
   * In case the card uses an image and horizontal direction is used we set flex row direction.
   */
  protected readonly classCardHorizontal = computed(
    () => !!this.imgSrc() && this.imgDir() === 'horizontal'
  );
  /**
   * Returns `true` when primary or secondary actions are set.
   */
  readonly displayContentActionBar = computed(
    () => this.primaryActions()?.length > 0 || this.secondaryActions()?.length > 0
  );
}
