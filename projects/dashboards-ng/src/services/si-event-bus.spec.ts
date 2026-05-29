/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiEventBus, SiEventType } from './si-event-bus';

describe('SiEventBus', () => {
  let eventBus: SiEventBus<SiEventType>;

  const sharedStateSymbol = Symbol.for('eventBusSharedState');

  beforeEach(() => {
    // Clean up shared state on window between tests
    const state = (window as any)[sharedStateSymbol];
    if (state) {
      for (const key of Object.keys(state)) {
        delete state[key];
      }
    }

    TestBed.configureTestingModule({
      providers: [SiEventBus]
    });
    eventBus = TestBed.inject(SiEventBus);
  });

  describe('#emit()', () => {
    it('should update the snapshot state', () => {
      eventBus.emit('languageChange', 'de');
      expect(eventBus.snapshot('languageChange')).toBe('de');
    });

    it('should overwrite previous state for the same event', () => {
      eventBus.emit('languageChange', 'de');
      eventBus.emit('languageChange', 'en');
      expect(eventBus.snapshot('languageChange')).toBe('en');
    });
  });

  describe('#on()', () => {
    it('should return an observable that emits when the event fires', () => {
      const values: string[] = [];
      eventBus.on('languageChange').subscribe(val => values.push(val));

      eventBus.emit('languageChange', 'de');
      eventBus.emit('languageChange', 'fr');

      expect(values).toEqual(['de', 'fr']);
    });

    it('should return the same observable for repeated calls', () => {
      const obs1 = eventBus.on('languageChange');
      const obs2 = eventBus.on('languageChange');

      const values1: string[] = [];
      const values2: string[] = [];
      obs1.subscribe(val => values1.push(val));
      obs2.subscribe(val => values2.push(val));

      eventBus.emit('languageChange', 'de');

      expect(values1).toEqual(['de']);
      expect(values2).toEqual(['de']);
    });

    it('should support multiple event types independently', () => {
      const languages: string[] = [];
      const filters: unknown[] = [];
      eventBus.on('languageChange').subscribe(val => languages.push(val));
      eventBus.on('filter').subscribe(val => filters.push(val));

      eventBus.emit('languageChange', 'de');
      eventBus.emit('filter', [{ key: 'status', value: 'active' }]);

      expect(languages).toEqual(['de']);
      expect(filters).toEqual([[{ key: 'status', value: 'active' }]]);
    });

    it('should not emit to subscribers of a different event', () => {
      const themeValues: unknown[] = [];
      eventBus.on('themeChange').subscribe(val => themeValues.push(val));

      eventBus.emit('languageChange', 'de');

      expect(themeValues).toEqual([]);
    });
  });

  describe('#snapshot()', () => {
    it('should return the full state when called without arguments', () => {
      eventBus.emit('languageChange', 'de');
      eventBus.emit('themeChange', { name: 'dark', schemes: {} } as any);

      const state = eventBus.snapshot();
      expect(state).toEqual(
        expect.objectContaining({
          languageChange: 'de',
          themeChange: expect.objectContaining({ name: 'dark' })
        })
      );
    });

    it('should return undefined for an event that was never emitted', () => {
      expect(eventBus.snapshot('languageChange')).toBeUndefined();
    });

    it('should return the data for a specific event', () => {
      eventBus.emit('languageChange', 'en');
      expect(eventBus.snapshot('languageChange')).toBe('en');
    });

    it('should filter array data by keys', () => {
      eventBus.emit('filter', [
        { key: 'dateRange', value: { start: new Date(), end: new Date() } },
        { key: 'timeZone', value: 'UTC' },
        { key: 'status', value: 'active' }
      ]);

      const result = eventBus.snapshot('filter', ['dateRange']);
      expect(result.length).toBe(1);
      expect(result[0].key).toBe('dateRange');
    });

    it('should return empty array when no keys match', () => {
      eventBus.emit('filter', [{ key: 'status', value: 'active' }]);

      const result = eventBus.snapshot('filter', ['nonExistentKey']);
      expect(result.length).toBe(0);
    });
  });
});
