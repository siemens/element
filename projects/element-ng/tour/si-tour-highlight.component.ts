/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SI_TOUR_TOKEN } from './si-tour-token.model';

@Component({
  selector: 'si-tour-highlight',
  templateUrl: './si-tour-highlight.component.html',
  styleUrl: './si-tour-highlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTourHighlightComponent {
  private tourToken = inject(SI_TOUR_TOKEN);
  private anchor?: ElementRef;
  protected readonly dim = signal({ top: 0, left: 0, width: 0, height: 0 });

  constructor() {
    this.tourToken.currentStep.pipe(takeUntilDestroyed()).subscribe(step => {
      this.anchor = step.anchor;
      this.updateHighlight();
    });
    this.tourToken.sizeChange.pipe(takeUntilDestroyed()).subscribe(() => this.updateHighlight());
  }

  private updateHighlight(): void {
    if (!this.anchor) {
      this.dim.set({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }
    const rect = this.anchor.nativeElement.getBoundingClientRect();
    this.dim.set({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }
}
