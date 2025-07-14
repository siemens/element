/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  provideSiUiState,
  SI_UI_STATE_SERVICE,
  SiUIStateService,
  UIStateStorage
} from './si-uistate.service';

describe('SiUIStateService', () => {
  let service: SiUIStateService;

  describe('with synchronous store', () => {
    @Injectable()
    class SynchronousMockStore implements UIStateStorage {
      private store: Record<string, string> = {};
      save(key: string, data: string): void {
        this.store[key] = data;
      }

      load(key: string): string | Promise<string | undefined | null> | null | undefined {
        return this.store[key];
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideSiUiState({ store: SynchronousMockStore })]
      }).compileComponents();
      service = TestBed.inject(SI_UI_STATE_SERVICE);
    });

    it('should load synchronously', () => {
      let loaded: string | undefined | null;
      service.save('key', 'value');
      service.load<string>('key').then(value => (loaded = value));
      expect(loaded).toEqual('value');
    });
  });

  describe('with asynchronous store', () => {
    @Injectable()
    class AsynchronousMockStore implements UIStateStorage {
      private store: Record<string, string> = {};
      async save(key: string, data: string): Promise<void> {
        this.store[key] = data;
      }

      async load(key: string): Promise<string | undefined | null> {
        return Promise.resolve(this.store[key]);
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideSiUiState({ store: AsynchronousMockStore })]
      }).compileComponents();
      service = TestBed.inject(SI_UI_STATE_SERVICE);
    });

    it('should load asynchronously', async () => {
      let loaded: string | undefined | null;
      await service.save('key', 'value');
      const loading = service.load<string>('key').then(value => (loaded = value));
      expect(loaded).toBeUndefined();
      await loading;
      expect(loaded).toEqual('value');
    });
  });
});
