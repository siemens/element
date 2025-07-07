/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiCardBaseDirective } from './si-card-base.directive';

/**
 * An action card component that extends the base card component with option to
 * either select the whole card or trigger an action.
 *
 * Usage:
 * as selectable card:
 * `<button si-card selectable type="button" [(selected)]="isSelected">...</button>`
 *
 * or as an action card:
 * `<button si-card type="button" (click)="doSomeAction()">...</button>`
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-action-card]',
  imports: [SiTranslatePipe],
  templateUrl: './si-action-card.component.html',
  styleUrl: './si-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
   * Makes whole card selectable.
   *
   * @defaultValue false
   */
  readonly selectable = input(false, {
    transform: booleanAttribute
  });
  /**
   * Indicates if the card is selected.
   * Ignored when `selectable` is not set to `true`.
   *
   * @defaultValue false
   * */
  readonly selected = model(false);

  protected headingId = `${this.id}-heading`;
  protected subHeadingId = `${this.id}-subHeading`;
  protected contentId = `${this.id}-content`;
}
