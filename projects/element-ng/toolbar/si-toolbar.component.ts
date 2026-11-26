/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { VERSION } from '@angular/aria';
import { Toolbar } from '@angular/aria/toolbar';
import { computed, DestroyRef, Component, ElementRef, inject, input } from '@angular/core';

/**
 * Visual variant of the toolbar.
 * - `floating`: elevated container which floats above the content, e.g. a canvas.
 * - `docked`: flat container which is attached to an edge of the content.
 */
export type SiToolbarVariant = 'floating' | 'docked';

/**
 * Edge of the closest positioned ancestor to which the toolbar is attached.
 * `start` and `end` respect the text direction.
 */
export type SiToolbarPlacement = 'top' | 'bottom' | 'start' | 'end';

/**
 * Alignment of a floating toolbar along the edge specified by `placement`.
 * For horizontal placements (`top`, `bottom`), `start` and `end` respect the text direction.
 * For vertical placements (`start`, `end`), `start` aligns to the top and `end` aligns to the bottom.
 */
export type SiToolbarAlignment = 'start' | 'center' | 'end';

/**
 * Before v22.2, the Angular Aria toolbar handles Enter and Space as selection keys
 * and prevents their default action, so that items like buttons cannot be activated.
 */
const legacyToolbarKeyHandling =
  +VERSION.major < 22 || (+VERSION.major === 22 && +VERSION.minor < 2);

/**
 * The toolbar groups frequently used actions in one compact container.
 * It implements the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
 * based on the [Angular Aria toolbar](https://angular.dev/guide/aria/toolbar), so that only one
 * item is in the tab sequence and the arrow keys move the focus between the items.
 *
 * Mark each item with the `ngToolbarWidget` directive from `@angular/aria/toolbar` and use
 * {@link SiToolbarGroupComponent} to structure the items into sections.
 *
 * The following inputs of the Angular Aria toolbar are available:
 * - `orientation`: `'horizontal'` (default) or `'vertical'`.
 * - `wrap`: Whether the focus wraps around at the first and last item. Defaults to `true`.
 * - `softDisabled`: Whether disabled items stay focusable. Defaults to `true`.
 * - `disabled`: Whether the whole toolbar is disabled. Defaults to `false`.
 */
@Component({
  selector: 'si-toolbar',
  template: '<ng-content />',
  styleUrl: './si-toolbar.component.scss',
  host: {
    class: 'si-toolbar',
    '[class.si-toolbar-vertical]': 'vertical()',
    '[class.si-toolbar-docked]': "variant() === 'docked'",
    '[class]': 'placementClasses()'
  },
  hostDirectives: [
    { directive: Toolbar, inputs: ['orientation', 'wrap', 'softDisabled', 'disabled'] }
  ]
})
export class SiToolbarComponent {
  /**
   * The visual variant of the toolbar.
   *
   * @defaultValue 'floating'
   */
  readonly variant = input<SiToolbarVariant>('floating');

  /**
   * Attaches the toolbar to an edge of its closest positioned ancestor, e.g. an element
   * with the `position-relative` class. A floating toolbar is positioned along that edge
   * according to {@link alignment} (centered by default), a docked toolbar spans the full edge.
   * To keep a distance to the edge, add a margin on that side, e.g. the `mb-5` class for the
   * `bottom` placement.
   * Without a placement, the toolbar is part of the regular layout flow.
   *
   * Use a vertical `orientation` for the `start` and `end` placements.
   */
  readonly placement = input<SiToolbarPlacement>();

  /**
   * Alignment of a floating toolbar along the edge specified by {@link placement}.
   * Only applies when {@link variant} is `'floating'` and {@link placement} is set.
   *
   * @defaultValue 'center'
   */
  readonly alignment = input<SiToolbarAlignment>('center');

  private readonly toolbar = inject(Toolbar);

  protected readonly vertical = computed(() => this.toolbar.orientation() === 'vertical');

  protected readonly placementClasses = computed(() => {
    const placement = this.placement();
    if (!placement) {
      return '';
    }
    return this.variant() === 'floating'
      ? `si-toolbar-placement-${placement} si-toolbar-align-${this.alignment()}`
      : `si-toolbar-placement-${placement}`;
  });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // Soft disabled items stay focusable, so their activation needs to be prevented.
    // As capturing listener of an ancestor, it runs before any click listener of the item.
    const preventDisabledActivation = (event: Event): void => {
      const disabledItem = (event.target as Element).closest('[aria-disabled="true"]');
      if (disabledItem && element.contains(disabledItem)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Stops Enter and Space on the item, so they do not reach the legacy toolbar key handling.
    // The listener is added to the target while capturing, so it runs after the listeners of the item.
    const stopPropagation = (event: Event): void => event.stopPropagation();
    const keepNativeActivation = (event: KeyboardEvent): void => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target !== element) {
        event.target?.addEventListener('keydown', stopPropagation, { once: true });
      }
    };

    element.addEventListener('click', preventDisabledActivation, { capture: true });
    if (legacyToolbarKeyHandling) {
      element.addEventListener('keydown', keepNativeActivation, { capture: true });
    }
    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('click', preventDisabledActivation, { capture: true });
      element.removeEventListener('keydown', keepNativeActivation, { capture: true });
    });
  }
}
