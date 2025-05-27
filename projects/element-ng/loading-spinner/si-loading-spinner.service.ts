/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiLoadingService {
  /**
   * Counts the number of loads active, is `0` when all loading is finished (or hasn't started).
   */
  readonly counter: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Start the loading.
   */
  startLoad(): void {
    this.counter.next(this.counter.value + 1);
  }

  /**
   * Stop the loading.
   */
  stopLoad(): void {
    if (this.counter.value > 0) {
      this.counter.next(this.counter.value - 1);
    }
  }
}
