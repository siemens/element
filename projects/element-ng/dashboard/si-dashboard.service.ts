/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SiDashboardCardComponent } from './si-dashboard-card.component';

@Injectable()
export class SiDashboardService {
  private cards = new BehaviorSubject<SiDashboardCardComponent[]>([]);
  /**
   * Subject containing the current dashboard cards as a list.
   *
   * @defaultValue this.cards.asObservable()
   */
  readonly cards$ = this.cards.asObservable();

  /**
   * Registers a new dashboard card.
   */
  register(card: SiDashboardCardComponent): void {
    const nextCards = this.cards.value;
    nextCards.push(card);
    this.cards.next(nextCards);
  }

  /**
   * Removes a registered dashboard card.
   */
  unregister(card: SiDashboardCardComponent): void {
    const nextCards = this.cards.value;
    const index = nextCards.indexOf(card);
    if (index > -1) {
      nextCards.splice(index, 1);
      this.cards.next(nextCards);
    }
  }
}
