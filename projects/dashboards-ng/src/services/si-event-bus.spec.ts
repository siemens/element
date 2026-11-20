/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { getEventBusInstance, SiEvent, SiEventType } from '@siemens/dashboards-ng/event-bus';
import { Observable } from 'rxjs';

import { SiEventBusImpl } from '../../event-bus/si-event-bus.impl';
import { SI_EVENT_BUS_SOURCE, SiEventBus } from './si-event-bus';

/* eslint-disable @typescript-eslint/naming-convention */
declare module '@siemens/dashboards-ng/event-bus' {
  interface SiEventMap {
    'test.status': boolean;
    'test.deep.value': number;
    'filter.location': { id: string } | null;
  }
}
/* eslint-enable @typescript-eslint/naming-convention */

describe('SiEventBus', () => {
  let eventBus: SiEventBus;

  const stateKey = Symbol.for('si-event-bus');

  beforeEach(() => {
    const state = (window as any)[stateKey];
    if (state) {
      for (const key of Object.keys(state)) {
        delete state[key];
      }
    }
    eventBus = TestBed.inject(SiEventBus);
  });

  const collect = <T>(observable: Observable<T>): T[] => {
    const values: T[] = [];
    observable.subscribe(value => values.push(value));
    return values;
  };

  describe('#emit()', () => {
    it('should create a CloudEvents envelope', () => {
      eventBus.emit('app.language', 'de');

      const event = eventBus.snapshot('app.language')!;
      expect(event).toMatchObject({
        specversion: '1.0',
        type: 'app.language',
        source: '/',
        data: 'de'
      });
      expect(event.id).toEqual(expect.any(String));
      expect(new Date(event.time).toISOString()).toBe(event.time);
      expect(event).not.toHaveProperty('subject');
    });

    it('should apply source and subject from the options', () => {
      eventBus.emit('app.language', 'de', { source: '/widgets/a', subject: 'user' });

      expect(eventBus.snapshot('app.language')).toMatchObject({
        source: '/widgets/a',
        subject: 'user'
      });
    });

    it('should freeze the event', () => {
      eventBus.emit('app.language', 'de');

      expect(Object.isFrozen(eventBus.snapshot('app.language'))).toBe(true);
    });

    it('should create a new event for every emit with the same data', () => {
      const events = collect(eventBus.on('app.language'));

      eventBus.emit('app.language', 'de');
      eventBus.emit('app.language', 'de');

      expect(events).toHaveLength(2);
      expect(events[0].id).not.toBe(events[1].id);
    });

    it('should clear a filter by emitting null', () => {
      eventBus.emit('filter.timeZone', 'UTC');
      eventBus.emit('filter.timeZone', null);

      expect(eventBus.snapshot('filter.timeZone')?.data).toBeNull();
    });

    it('should throw for event types containing a wildcard', () => {
      expect(() => eventBus.emit('filter.*' as SiEventType, null)).toThrowError(/wildcard/);
      expect(() => eventBus.emit('*' as SiEventType, null)).toThrowError(/wildcard/);
    });

    it('should generate ids without crypto.randomUUID', () => {
      vi.stubGlobal('crypto', {});
      try {
        eventBus.emit('app.language', 'de');
        const first = eventBus.snapshot('app.language')!.id;
        eventBus.emit('app.language', 'de');

        expect(eventBus.snapshot('app.language')!.id).not.toBe(first);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('#emit() with multiple events', () => {
    it('should emit one event per type', () => {
      const events = collect(eventBus.on('*'));

      eventBus.emit({ 'app.language': 'de', 'test.status': true }, { source: '/batch' });

      expect(events.map(event => [event.type, event.data, event.source])).toEqual([
        ['app.language', 'de', '/batch'],
        ['test.status', true, '/batch']
      ]);
    });

    it('should store all events before delivering any', () => {
      const seen: unknown[] = [];
      eventBus
        .on('app.language')
        .subscribe(() => seen.push(eventBus.snapshot('test.status')?.data));

      eventBus.emit({ 'app.language': 'de', 'test.status': true });

      expect(seen).toEqual([true]);
    });

    it('should ignore types with an undefined value', () => {
      const events = collect(eventBus.on('*'));

      eventBus.emit({ 'app.language': 'de', 'test.status': undefined });

      expect(events.map(event => event.type)).toEqual(['app.language']);
    });

    it('should throw before emitting anything if a type contains a wildcard', () => {
      const events = collect(eventBus.on('*'));

      expect(() =>
        eventBus.emit({ 'app.language': 'de', ['test.*' as 'test.status']: true })
      ).toThrowError(/wildcard/);
      expect(events).toEqual([]);
      expect(eventBus.snapshot('app.language')).toBeUndefined();
    });
  });

  describe('#on()', () => {
    it('should deliver events of the given type', () => {
      const events = collect(eventBus.on('app.language'));

      eventBus.emit('app.language', 'de');
      eventBus.emit('filter.timeZone', 'UTC');

      expect(events.map(event => event.data)).toEqual(['de']);
    });

    it('should not replay events emitted before subscribing', () => {
      eventBus.emit('app.language', 'de');

      expect(collect(eventBus.on('app.language'))).toEqual([]);
    });

    it('should deliver events of multiple types', () => {
      const events = collect(eventBus.on(['app.language', 'test.status']));

      eventBus.emit('app.language', 'de');
      eventBus.emit('test.status', true);
      eventBus.emit('filter.timeZone', 'UTC');

      expect(events.map(event => event.type)).toEqual(['app.language', 'test.status']);
    });

    it('should match prefix wildcards at any depth', () => {
      const events = collect(eventBus.on('test.*'));

      eventBus.emit('test.status', true);
      eventBus.emit('test.deep.value', 1);
      eventBus.emit('app.language', 'de');

      expect(events.map(event => event.type)).toEqual(['test.status', 'test.deep.value']);
    });

    it('should deliver all events for *', () => {
      const events = collect(eventBus.on('*'));

      eventBus.emit('app.language', 'de');
      eventBus.emit('test.status', true);

      expect(events).toHaveLength(2);
    });

    it('should deliver an event only once when multiple patterns match', () => {
      const events = collect(eventBus.on(['test.*', 'test.status', '*']));

      eventBus.emit('test.status', true);

      expect(events).toHaveLength(1);
    });
  });

  describe('#snapshot()', () => {
    it('should return undefined for an event that was never emitted', () => {
      expect(eventBus.snapshot('app.language')).toBeUndefined();
    });

    it('should return the latest event of the given type', () => {
      eventBus.emit('app.language', 'de');
      eventBus.emit('app.language', 'en');

      expect(eventBus.snapshot('app.language')?.data).toBe('en');
    });
  });

  describe('source', () => {
    it('should use SI_EVENT_BUS_SOURCE as default source', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: SI_EVENT_BUS_SOURCE, useValue: '/app' }]
      });

      TestBed.inject(SiEventBus).emit('app.language', 'de');

      expect(eventBus.snapshot('app.language')?.source).toBe('/app');
    });

    it('should use the source of getEventBusInstance()', () => {
      getEventBusInstance({ source: '/react' }).emit('app.language', 'de');

      expect(eventBus.snapshot('app.language')?.source).toBe('/react');
    });
  });

  describe('without window', () => {
    it('should do nothing', () => {
      const ssrEventBus = new SiEventBusImpl('/', null);
      const events = collect(ssrEventBus.on('*'));

      ssrEventBus.emit('app.language', 'de');

      expect(events).toEqual([]);
      expect(ssrEventBus.snapshot('app.language')).toBeUndefined();
      expect(eventBus.snapshot('app.language')).toBeUndefined();
    });
  });

  describe('interoperability with getEventBusInstance()', () => {
    it('should return the same instance per source', () => {
      expect(getEventBusInstance()).toBe(getEventBusInstance({ source: '/' }));
      expect(getEventBusInstance({ source: '/a' })).toBe(getEventBusInstance({ source: '/a' }));
      expect(getEventBusInstance({ source: '/a' })).not.toBe(getEventBusInstance());
    });

    it('should share events and state with the Angular service', () => {
      const external = collect(getEventBusInstance().on('app.language'));
      const angular = collect(eventBus.on('app.language'));

      eventBus.emit('app.language', 'de');
      getEventBusInstance().emit('app.language', 'fr');

      expect(external.map(event => event.data)).toEqual(['de', 'fr']);
      expect(angular.map(event => event.data)).toEqual(['de', 'fr']);
      expect(getEventBusInstance().snapshot('app.language')?.data).toBe('fr');
    });
  });

  describe('typing', () => {
    it('should type built-in events', () => {
      expectTypeOf<SiEvent<'filter.timeZone'>['data']>().toEqualTypeOf<string | null>();
    });

    it('should type augmented and overridden events', () => {
      expectTypeOf<SiEvent<'test.status'>['data']>().toEqualTypeOf<boolean>();
      expectTypeOf<SiEvent<'filter.location'>['data']>().toEqualTypeOf<{ id: string } | null>();
    });

    it('should type snapshot() and wildcard subscriptions', () => {
      expectTypeOf(eventBus.snapshot('test.status')).toEqualTypeOf<
        SiEvent<'test.status'> | undefined
      >();
      expectTypeOf(eventBus.on('test.*')).toEqualTypeOf<
        Observable<SiEvent<'test.status'> | SiEvent<'test.deep.value'>>
      >();
      expectTypeOf(eventBus.on(['test.status', 'app.language'])).toEqualTypeOf<
        Observable<SiEvent<'test.status'> | SiEvent<'app.language'>>
      >();
    });

    it('should reject unregistered event types and wrong data', () => {
      // @ts-expect-error not registered
      expect(eventBus.snapshot('unknown')).toBeUndefined();
      // @ts-expect-error wrong data type
      eventBus.emit('test.status', 'yes');
      // @ts-expect-error wrong data type
      eventBus.emit({ 'test.status': 'yes' });
    });
  });
});
