/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, input } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

@Directive({
  host: {
    class: 'card',
    '[class.card-horizontal]': 'classCardHorizontal()',
    '[style.--si-card-img-object-fit]': 'imgObjectFit()',
    '[style.--si-card-img-object-position]': 'imgObjectPosition()'
  }
})
export abstract class SiCardBaseDirective {
  /**
   * Card header text.
   */
  readonly heading = input<TranslatableString>();
  /**
   * Card secondary header text.
   */
  readonly subHeading = input<TranslatableString>();
  /**
   * Image source for the card.
   */
  readonly imgSrc = input<string>();
  /**
   * Alt text for a provided image.
   */
  readonly imgAlt = input<TranslatableString>();
  /**
   * Defines if an image is placed on top or start (left) of the card.
   *
   * @defaultValue 'vertical'
   */
  readonly imgDir = input<('horizontal' | 'vertical') | undefined>('vertical');
  /**
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
}
