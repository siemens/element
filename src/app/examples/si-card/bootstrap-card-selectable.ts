/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './bootstrap-card-selectable.html'
})
export class SampleComponent {
  selectedCard: string | null = null;

  protected onCardSelect(cardId: string): void {
    if (this.selectedCard === cardId) {
      this.selectedCard = null; // Deselect if already selected
      return;
    }
    this.selectedCard = cardId;
  }
}
