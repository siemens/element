/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OverlayRef } from '@angular/cdk/overlay';
import { booleanAttribute, Directive, inject, input, TemplateRef } from '@angular/core';
import { filter, map, merge, Observable, tap } from 'rxjs';

import { SiCustomSelectDirective } from './si-custom-select.directive';

/**
 * Possible values for the `aria-haspopup` attribute exposed by the
 * combobox host of a custom select.
 */
export type SiSelectDropdownContentType =
  'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

/**
 * Structural directive marking the dropdown template for custom selects
 * built with {@link SiCustomSelectDirective}.
 *
 * When placed on an `<ng-template>`, it automatically registers the template
 * with the parent {@link SiCustomSelectDirective}.
 *
 * @example
 * ```html
 * <ng-template si-select-dropdown contentType="listbox">
 *   <!-- custom dropdown content -->
 * </ng-template>
 * ```
 *
 * @experimental
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[si-select-dropdown]'
})
export class SiSelectDropdownDirective {
  /**
   * Describes the kind of content rendered by the dropdown. The value is
   * forwarded to the `aria-haspopup` attribute of the combobox host of
   * the parent {@link SiCustomSelectDirective}.
   */
  readonly contentType = input.required<SiSelectDropdownContentType>();

  /**
   * Whether pressing Tab closes the dropdown.
   *
   * Keep this disabled when the dropdown contains controls that users must reach with Tab.
   *
   * @defaultValue false
   */
  readonly closeOnTab = input(false, { transform: booleanAttribute });

  /** @internal */
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const customSelect = inject(SiCustomSelectDirective, { optional: true });
    customSelect?.registerDropdown(this);
  }

  /**
   * Emits when the overlay should close; the value indicates whether focus should be restored.
   * Completes when the overlay is disposed.
   * @internal
   */
  overlayCloseEvents(overlayRef: OverlayRef): Observable<boolean> {
    const escape$ = overlayRef.keydownEvents().pipe(
      filter(event => event.key === 'Escape'),
      tap(event => event.stopPropagation()),
      map(() => true)
    );
    const tab$ = overlayRef.keydownEvents().pipe(
      filter(event => event.key === 'Tab' && this.closeOnTab()),
      map(() => true)
    );
    const dismiss$ = merge(overlayRef.backdropClick(), overlayRef.detachments()).pipe(
      map(() => false)
    );
    return merge(escape$, tab$, dismiss$);
  }
}
