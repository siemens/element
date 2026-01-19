/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { SiDefaultWidgetStorage } from './si-widget-storage';

describe('SiDefaultWidgetStorage', () => {
  let widgetStorage: SiDefaultWidgetStorage;

  beforeEach(() => {
    widgetStorage = TestBed.configureTestingModule({
      providers: [SiDefaultWidgetStorage]
    }).inject(SiDefaultWidgetStorage);
  });

  describe('#load()', () => {
    it('with dashboardId should return widget config observable', () => {
      const widgitConfigs$ = widgetStorage.load('id');
      expect(widgitConfigs$).toBeDefined();
    });
    it('without dashboardId should return widget config observable', () => {
      const widgitConfigs$ = widgetStorage.load();
      expect(widgitConfigs$).toBeDefined();
    });
    it('with different ids should return different objects', () => {
      const widgitConfigs$ = widgetStorage.load();
      const widgitConfigs1$ = widgetStorage.load('1');
      const widgitConfigs2$ = widgetStorage.load('2');
      expect(widgitConfigs$).not.toBe(widgitConfigs1$);
      expect(widgitConfigs$).not.toBe(widgitConfigs2$);
    });
    it('with same ids should return same objects', () => {
      const widgitConfigs1$ = widgetStorage.load('1');
      const widgitConfigs2$ = widgetStorage.load('1');
      expect(widgitConfigs1$).toBe(widgitConfigs2$);
    });
  });
});
