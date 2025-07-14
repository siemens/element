/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SiListDetailsComponent } from '../si-list-details.component';

/** @experimental */
@Component({
  selector: 'si-list-pane',
  templateUrl: './si-list-pane.component.html',
  styleUrl: './si-list-pane.component.scss',
  host: {
    '[class.expanded]': 'parent.hasLargeSize()',
    '[class.details-active]': 'parent.detailsActive() && !parent.hasLargeSize()',
    '[attr.inert]': '!parent.hasLargeSize() && parent.detailsActive() ? "" : null',
    '[attr.tabindex]': '-1',
    '[style.max-inline-size]': 'parent.maxListSize()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiListPaneComponent {
  protected parent = inject(SiListDetailsComponent);
  private element: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    this.parent.transferFocusToList
      .pipe(takeUntilDestroyed())
      .subscribe(previouslyFocusedElement => {
        // Needed so it's no longer "inert".
        setTimeout(() => {
          const currentlyFocused = document?.activeElement;
          previouslyFocusedElement?.focus();
          // If there was no previously focused element or if it couldn't be focused anymore, fall back to the focusing the list.
          if (currentlyFocused === document?.activeElement) {
            this.element?.nativeElement?.focus();
          }
        });
      });
  }
}
