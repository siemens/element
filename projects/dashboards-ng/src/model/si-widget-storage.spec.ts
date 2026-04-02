/**
 * Copyright (c) Siemens 2016 - 2026
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
      const widgetConfigs$ = widgetStorage.load('id');
      expect(widgetConfigs$).toBeDefined();
    });
    it('without dashboardId should return widget config observable', () => {
      const widgetConfigs$ = widgetStorage.load();
      expect(widgetConfigs$).toBeDefined();
    });
    it('with different ids should return different objects', () => {
      const widgetConfigs$ = widgetStorage.load();
      const widgetConfigs1$ = widgetStorage.load('1');
      const widgetConfigs2$ = widgetStorage.load('2');
      expect(widgetConfigs$).not.toBe(widgetConfigs1$);
      expect(widgetConfigs$).not.toBe(widgetConfigs2$);
    });
    it('with same ids should return same objects', () => {
      const widgetConfigs1$ = widgetStorage.load('1');
      const widgetConfigs2$ = widgetStorage.load('1');
      expect(widgetConfigs1$).toBe(widgetConfigs2$);
    });
  });
});
