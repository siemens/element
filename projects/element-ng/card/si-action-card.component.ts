/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input, model } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiCardBaseDirective } from './si-card-base.directive';
import { SiCardHeaderComponent } from './si-card-header.component';

/**
 * An action card component that supports actions and selection on native buttons,
 * and navigation on native anchors.
 *
 * **Important:** The `selectable` and `selected` inputs are supported only on button action cards. Do not
 * use them with an anchor.
 *
 * Usage:
 * as a selectable button card:
 * `<button si-action-card selectable type="button" [(selected)]="isSelected">...</button>`
 *
 * or as an action button card:
 * `<button si-action-card type="button" (click)="doSomeAction()">...</button>`
 *
 * or as a navigation card:
 * `<a si-action-card href="/details">...</a>`
 * `<a si-action-card routerLink="/details" routerLinkActive="selected">...</a>`
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-action-card], a[si-action-card]',
  imports: [SiCardHeaderComponent, SiTranslatePipe],
  templateUrl: './si-action-card.component.html',
  styleUrl: './si-card.component.scss',
  host: {
    class: 'action-card',
    '[attr.aria-pressed]': 'selectable() ? (selected() ? "true" : "false") : undefined',
    '[attr.aria-labelledby]': 'heading() ? headingId : undefined',
    '[attr.aria-describedby]': 'subHeading() ? `${subHeadingId} ${contentId}` : contentId',
    '[class.selected]': 'selectable() && selected()',
    '(click)': 'selectable() ? selected.set(!selected()) : null'
  }
})
export class SiActionCardComponent extends SiCardBaseDirective {
  private static idCounter = 0;
  private id = `__si-action-card-${SiActionCardComponent.idCounter++}`;
  /**
   * Makes a button action card selectable.
   *
   * @defaultValue false
   */
  readonly selectable = input(false, {
    transform: booleanAttribute
  });
  /**
   * Indicates whether a selectable button action card is selected.
   *
   * @defaultValue false
   */
  readonly selected = model(false);

  protected headingId = `${this.id}-heading`;
  protected subHeadingId = `${this.id}-subHeading`;
  protected contentId = `${this.id}-content`;
}
