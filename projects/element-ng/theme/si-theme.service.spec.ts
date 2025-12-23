/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockedObject
} from 'vitest';

import { SI_THEME_LOCAL_STORAGE_KEY, SiThemeStore } from './si-theme-store';
import { ELEMENT_THEME_NAME, Theme } from './si-theme.model';
import { SiThemeService as TestService } from './si-theme.service';

describe('SiThemeService', () => {
  let service: TestService;
  let themeSwitchSpy: Mock;

  const setupTestBed = (prefersDarkColor: boolean = false, store?: SiThemeStore): void => {
    document.documentElement.classList.remove('app--dark');
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () =>
        ({
          matches: prefersDarkColor,
          addEventListener: () => {},
          removeEventListener: () => {}
        }) as any
    );
    TestBed.configureTestingModule({
      providers: [
        TestService,
        { provide: SiThemeStore, useValue: store },
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(TestService);
    service.resolvedColorScheme$.subscribe(themeSwitchSpy);
  };

  beforeEach(() => (themeSwitchSpy = vi.fn()));
  afterEach(() => localStorage.removeItem(SI_THEME_LOCAL_STORAGE_KEY));

  describe('with theme type auto', () => {
    it('should set theme to `light` if preferred', () => {
      setupTestBed();
      service.applyThemeType('auto');
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('light');
    });

    it('should set theme to `dark` if preferred', () => {
      setupTestBed(true);
      service.applyThemeType('auto');
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('with fixed theme type values', () => {
    beforeEach(() => setupTestBed());

    it('should not set `app--dark` class on `light` mode', () => {
      service.applyThemeType('light');
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).not.toHaveBeenCalled(); // because light is the default
    });

    it('should set `app--dark` class on `dark` mode', () => {
      service.applyThemeType('dark');
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('without custom theme', () => {
    let theme: Theme;
    let store: MockedObject<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(),
        loadThemeNames: vi.fn(),
        saveTheme: vi.fn(),
        activateTheme: vi.fn(),
        loadTheme: vi.fn(),
        deactivateTheme: vi.fn(),
        deleteTheme: vi.fn()
      };
      store.loadActiveTheme.mockImplementation(() => of(undefined));
      store.loadThemeNames.mockImplementation(() => of([]));
      store.saveTheme.mockImplementation(() => of(true));
    });

    it('setActiveTheme of unknown theme should return false', async () => {
      setupTestBed();
      service.setActiveTheme('any').subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('should initially return undefined as active theme', async () => {
      setupTestBed();
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should use element as initial active theme', async () => {
      setupTestBed();
      expect(service.activeThemeName).toBe(ELEMENT_THEME_NAME);
      expect(service.hasTheme(ELEMENT_THEME_NAME)).toBe(true);
      expect(service.themeNames.length).toBe(1);
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('getTheme should return element theme by name', async () => {
      setupTestBed();
      service.getTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('getTheme should return undefined for unknown theme name', async () => {
      setupTestBed();
      service.getTheme('any').subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('addOrUpdateTheme should saveTheme on store', async () => {
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe(ok => {
        expect(ok).toBe(true);
        expect(store.saveTheme).toHaveBeenCalledTimes(1);
        expect(store.saveTheme).toHaveBeenCalledWith(theme);
      });
    });

    it('addOrUpdateTheme should return false on storage failure', async () => {
      store.saveTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe(ok => {
        expect(ok).toBe(false);
      });
    });

    it('addOrUpdateTheme should return error on storage errors', async () => {
      store.saveTheme.mockImplementation(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe({
        next: () => assert.fail(`shouldn't be called`),
        error: error => {
          expect(error).toBeDefined();
          expect(error).toBe('no network');
        }
      });
    });
  });

  describe('with custom active theme', () => {
    let theme: Theme;
    let store: MockedObject<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(),
        loadThemeNames: vi.fn(),
        deleteTheme: vi.fn(),
        deactivateTheme: vi.fn(),
        loadTheme: vi.fn(),
        activateTheme: vi.fn(),
        saveTheme: vi.fn()
      };
      store.loadActiveTheme.mockImplementation(() => of(theme));
      store.loadThemeNames.mockImplementation(() => of([theme.name]));
      store.loadTheme.mockImplementation(() => of(theme));
    });

    it('getActiveTheme should return other then element', async () => {
      setupTestBed(false, store);
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeDefined();
        expect(result!.name).toBe('example');
      });
    });

    it('deleteTheme with unknown theme should return false', async () => {
      store.deleteTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      service.deleteTheme('any').subscribe(result => {
        expect(result).toBe(false);
        expect(store.deleteTheme).not.toHaveBeenCalled();
      });
    });

    it('deleteTheme should call storage deleteTheme', async () => {
      store.deleteTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe(result => {
        expect(result).toBe(true);
        expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
      });
    });

    it('deleteTheme should return false on storage failures', async () => {
      store.deleteTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe(result => {
        expect(result).toBe(false);
        expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
      });
    });

    it('deleteTheme should return error on storage errors', async () => {
      store.deleteTheme.mockImplementation(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe({
        next: () => assert.fail(`shouldn't be called`),
        error: error => {
          expect(error).toBeDefined();
          expect(error).toBe('no network');
        }
      });
    });

    it('setActiveTheme with element should call deactive theme on storage', async () => {
      store.deactivateTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBe(true);
        expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
      });
    });

    it('setActiveTheme should return false on theme on storage failure', async () => {
      store.deactivateTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      expect(service.activeThemeName).toBe('example');
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBe(false);
        expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('with custom inactive theme', () => {
    let theme: Theme;
    let store: MockedObject<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(),
        loadThemeNames: vi.fn(),
        activateTheme: vi.fn(),
        loadTheme: vi.fn(),
        deactivateTheme: vi.fn(),
        saveTheme: vi.fn(),
        deleteTheme: vi.fn()
      };
      store.loadActiveTheme.mockImplementation(() => of(undefined));
      store.loadThemeNames.mockImplementation(() => of([theme.name]));
      store.activateTheme.mockImplementation(() => of(true));
      store.loadTheme.mockImplementation(() => of(theme));

      setupTestBed(false, store);
    });

    it('getTheme should return cached theme on second call', async () => {
      service
        .getTheme('example')
        .pipe(switchMap(() => service.getTheme('example')))
        .subscribe(result => {
          expect(result).toBeDefined();
          expect(result!.name).toBe('example');
          expect(store.loadTheme).toHaveBeenCalledTimes(1);
        });
    });

    it('getTheme should load theme from store', async () => {
      service.getTheme('example').subscribe(result => {
        expect(result).toBeDefined();
        expect(result!.name).toBe('example');
      });
    });

    it('setActiveTheme should invoke activateTheme on store', async () => {
      service.setActiveTheme(theme.name).subscribe(result => {
        expect(result).toBe(true);
        expect(store.activateTheme).toHaveBeenCalledTimes(1);
      });
    });

    it('setActiveTheme of current active theme should return true', async () => {
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBe(true);
        expect(store.activateTheme).toHaveBeenCalledTimes(0);
      });
    });
  });
});
