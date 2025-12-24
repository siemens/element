/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BlinkService } from './blink.service';

describe('BlinkService', () => {
  let service!: BlinkService;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({ providers: [BlinkService, provideZonelessChangeDetection()] });
    service = TestBed.inject(BlinkService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('triggers on/off pulses', () => {
    let onCount = 0;
    let offCount = 0;
    const subs = service.pulse$.subscribe(onOff => {
      if (onOff) {
        onCount++;
      } else {
        offCount++;
      }
    });

    jasmine.clock().tick(4 * 1400);

    subs.unsubscribe();

    expect(onCount).toBe(3);
    expect(offCount).toBe(2);
  });

  it('is synchronized', () => {
    let counter1 = 0;
    let counter2 = 0;
    const subs1 = service.pulse$.subscribe(() => counter1++);

    jasmine.clock().tick(500);
    counter1 = 0; // value not interesting
    const subs2 = service.pulse$.subscribe(() => counter2++);

    jasmine.clock().tick(4 * 1400);

    expect(counter1).toBe(counter2);

    subs1.unsubscribe();
    subs2.unsubscribe();
  });

  it('can be paused/resumed', () => {
    let counter = 0;
    const subs = service.pulse$.subscribe(() => counter++);

    jasmine.clock().tick(100);
    expect(counter).toBe(1); // 1 startup

    service.pause();
    expect(service.isPaused()).toBeTrue();

    jasmine.clock().tick(4 * 1400);
    expect(counter).toBe(2); // 2 because an "off" is forced

    service.resume();

    jasmine.clock().tick(4 * 1400);

    expect(counter).toBe(7); // 7: the two initial from above, 1 startup, 4 ticks

    subs.unsubscribe();
  });
});
