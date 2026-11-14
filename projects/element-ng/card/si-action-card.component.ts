/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model
} from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiCardBaseDirective } from './si-card-base.directive';
import { SiCardHeaderComponent } from './si-card-header.component';

/**
 * An action card component that extends the base card component with option to
 * either select the whole card, trigger an action, or navigate to a destination.
 *
 * Usage:
 * as selectable card:
 * `<button si-action-card selectable type="button" [(selected)]="isSelected">...</button>`
 *
 * or as an action card:
 * `<button si-action-card type="button" (click)="doSomeAction()">...</button>`
 *
 * or as a navigation card:
 * `<a si-action-card href="/details">...</a>`
 * `<a si-action-card routerLink="/details">...</a>`
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-action-card], a[si-action-card]',
  imports: [SiCardHeaderComponent, SiTranslatePipe],
  templateUrl: './si-action-card.component.html',
  styleUrl: './si-card.component.scss',
  host: {
    class: 'action-card',
    '[attr.aria-pressed]': 'isSelectable() ? (selected() ? "true" : "false") : undefined',
    '[attr.aria-labelledby]': 'heading() ? headingId : undefined',
    '[attr.aria-describedby]': 'subHeading() ? `${subHeadingId} ${contentId}` : contentId',
    '[class.selected]': 'isSelectable() && selected()',
    '(click)': 'isSelectable() ? selected.set(!selected()) : null'
  }
})
export class SiActionCardComponent extends SiCardBaseDirective {
  private static idCounter = 0;
  private id = `__si-action-card-${SiActionCardComponent.idCounter++}`;
  private readonly isButton = inject(ElementRef<HTMLElement>).nativeElement.tagName === 'BUTTON';
  /**
   * Makes whole card selectable.
   * Ignored on anchor elements.
   *
   * @defaultValue false
   */
  readonly selectable = input(false, {
    transform: booleanAttribute
  });
  /**
   * Indicates if the card is selected.
   * Ignored on anchor elements or when `selectable` is not set to `true`.
   *
   * @defaultValue false
   * */
  readonly selected = model(false);

  protected readonly isSelectable = computed(() => this.isButton && this.selectable());
  protected headingId = `${this.id}-heading`;
  protected subHeadingId = `${this.id}-subHeading`;
  protected contentId = `${this.id}-content`;
}
