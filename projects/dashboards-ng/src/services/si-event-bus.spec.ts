/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { getEventBusInstance } from '@siemens/dashboards-ng/event-bus';

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
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('dateRange');
    });

    it('should return empty array when no keys match', () => {
      eventBus.emit('filter', [{ key: 'status', value: 'active' }]);

      const result = eventBus.snapshot('filter', ['nonExistentKey']);
      expect(result).toHaveLength(0);
    });
  });

  describe('custom event types', () => {
    it('should emit and receive custom events', () => {
      type MyEvent = { name: 'statusUpdate'; data: boolean };
      const customEventBus = TestBed.inject(SiEventBus<MyEvent>);
      const values: boolean[] = [];
      customEventBus.on('statusUpdate').subscribe(val => values.push(val));

      customEventBus.emit('statusUpdate', true);

      expect(values).toEqual([true]);
    });
  });

  describe('interoperability with getEventBusInstance()', () => {
    it('should notify non-Angular subscribers and share the state', () => {
      const externalEventBus = getEventBusInstance();
      const values: string[] = [];
      externalEventBus.on('languageChange').subscribe(val => values.push(val));

      eventBus.emit('languageChange', 'de');

      expect(values).toEqual(['de']);
      expect(externalEventBus.snapshot('languageChange')).toBe('de');
    });

    it('should receive events emitted by non-Angular code', () => {
      const values: string[] = [];
      eventBus.on('languageChange').subscribe(val => values.push(val));

      getEventBusInstance().emit('languageChange', 'fr');

      expect(values).toEqual(['fr']);
      expect(eventBus.snapshot('languageChange')).toBe('fr');
    });
  });
});
