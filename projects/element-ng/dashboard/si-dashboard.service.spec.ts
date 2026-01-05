/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiDashboardCardComponent } from './si-dashboard-card.component';
import { SiDashboardService as TestService } from './si-dashboard.service';

describe('SiDashboardService', () => {
  let service: TestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TestService }, provideZonelessChangeDetection()]
    }).compileComponents();
    service = TestBed.inject(TestService);
  });

  it('should initially have no cards registered', async () => {
    service.cards$.subscribe(cards => {
      expect(cards).toEqual([]);
    });
  });

  it('should emit cards on registration', async () => {
    const card = {} as SiDashboardCardComponent;
    service.register(card);
    service.cards$.subscribe(cards => {
      expect(cards.length).toBe(1);
      expect(cards[0]).toBe(card);
    });
  });

  it('should emit cards on unregistration', async () => {
    const card1 = { name: '1' } as any as SiDashboardCardComponent;
    const card2 = { name: '2' } as any as SiDashboardCardComponent;
    service.register(card1);
    service.register(card2);
    service.unregister(card1);
    service.cards$.subscribe(cards => {
      expect(cards.length).toBe(1);
      expect(cards[0]).toBe(card2);
    });
  });
});
