/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BlinkService } from './blink.service';

describe('BlinkService', () => {
  let service!: BlinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BlinkService] });
    service = TestBed.inject(BlinkService);
  });

  it('triggers on/off pulses', fakeAsync(() => {
    let onCount = 0;
    let offCount = 0;
    const subs = service.pulse$.subscribe(onOff => {
      if (onOff) {
        onCount++;
      } else {
        offCount++;
      }
    });

    tick(4 * 1400);

    subs.unsubscribe();

    expect(onCount).toBe(3); // 3 because of the initial on pulse
    expect(offCount).toBe(2);
  }));

  it('is synchronized', fakeAsync(() => {
    let counter1 = 0;
    let counter2 = 0;
    const subs1 = service.pulse$.subscribe(() => counter1++);

    tick(500);
    counter1 = 0; // value not interesting
    const subs2 = service.pulse$.subscribe(() => counter2++);

    tick(4 * 1400);

    expect(counter1).toBe(counter2);

    subs1.unsubscribe();
    subs2.unsubscribe();
  }));

  it('can be paused/resumed', fakeAsync(() => {
    let counter = 0;
    const subs = service.pulse$.subscribe(() => counter++);

    tick(100);
    expect(counter).toBe(1); // 1 startup

    service.pause();
    expect(service.isPaused()).toBeTrue();

    tick(4 * 1400);
    expect(counter).toBe(2); // 2 because an "off" is forced

    service.resume();

    tick(4 * 1400);
    expect(counter).toBe(7); // 7: the two initial from above, 1 startup, 4 ticks

    subs.unsubscribe();
  }));
});
