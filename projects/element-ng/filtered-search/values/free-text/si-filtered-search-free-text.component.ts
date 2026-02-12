/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, ElementRef, viewChild } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiFilteredSearchValueBase } from '../si-filtered-search-value.base';

@Component({
  selector: 'si-filtered-search-free-text',
  imports: [SiTranslatePipe],
  templateUrl: './si-filtered-search-free-text.component.html',
  styleUrl: './si-filtered-search-free-text.component.scss',
  providers: [
    { provide: SiFilteredSearchValueBase, useExisting: SiFilteredSearchFreeTextComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchFreeTextComponent extends SiFilteredSearchValueBase {
  protected readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('freeTextInput');
  protected readonly validValue = computed(() => true);

  protected freeTextValueChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.criterionValue.update(v => ({ ...v, value: inputElement.value }));
  }

  protected override valueEnter(): void {
    this.active.set(false);
    this.submitValue.emit();
  }
}
