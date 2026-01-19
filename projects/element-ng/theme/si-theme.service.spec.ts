/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SI_THEME_LOCAL_STORAGE_KEY, SiThemeStore } from './si-theme-store';
import { ELEMENT_THEME_NAME, Theme } from './si-theme.model';
import { SiThemeService as TestService } from './si-theme.service';

describe('SiThemeService', () => {
  let service: TestService;
  let themeSwitchSpy: jasmine.Spy;

  const setupTestBed = (prefersDarkColor: boolean = false, store?: SiThemeStore): void => {
    document.documentElement.classList.remove('app--dark');
    spyOn(window, 'matchMedia').and.callFake(
      () =>
        ({
          matches: prefersDarkColor,
          addEventListener: () => {},
          removeEventListener: () => {}
        }) as any
    );
    TestBed.configureTestingModule({
      providers: [TestService, { provide: SiThemeStore, useValue: store }]
    });
    service = TestBed.inject(TestService);
    service.resolvedColorScheme$.subscribe(themeSwitchSpy);
  };

  beforeEach(() => (themeSwitchSpy = jasmine.createSpy()));
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
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', ['loadActiveTheme', 'loadThemeNames', 'saveTheme']);
      store.loadActiveTheme.and.callFake(() => of(undefined));
      store.loadThemeNames.and.callFake(() => of([]));
      store.saveTheme.and.callFake(() => of(true));
    });

    it('setActiveTheme of unknown theme should return false', (done: DoneFn) => {
      setupTestBed();
      service.setActiveTheme('any').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should initially return undefined as active theme', (done: DoneFn) => {
      setupTestBed();
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('should use element as initial active theme', (done: DoneFn) => {
      setupTestBed();
      expect(service.activeThemeName).toBe(ELEMENT_THEME_NAME);
      expect(service.hasTheme(ELEMENT_THEME_NAME)).toBeTrue();
      expect(service.themeNames.length).toBe(1);
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('getTheme should return element theme by name', (done: DoneFn) => {
      setupTestBed();
      service.getTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('getTheme should return undefined for unknown theme name', (done: DoneFn) => {
      setupTestBed();
      service.getTheme('any').subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('addOrUpdateTheme should saveTheme on store', (done: DoneFn) => {
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe(ok => {
        expect(ok).toBeTrue();
        expect(store.saveTheme).toHaveBeenCalledTimes(1);
        expect(store.saveTheme).toHaveBeenCalledWith(theme);
        done();
      });
    });

    it('addOrUpdateTheme should return false on storage failure', (done: DoneFn) => {
      store.saveTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe(ok => {
        expect(ok).toBeFalse();
        done();
      });
    });

    it('addOrUpdateTheme should return error on storage errors', (done: DoneFn) => {
      store.saveTheme.and.callFake(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      service.addOrUpdateTheme(theme).subscribe({
        next: () => fail(),
        error: error => {
          expect(error).toBeDefined();
          expect(error).toBe('no network');
          done();
        }
      });
    });
  });

  describe('with custom active theme', () => {
    let theme: Theme;
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', [
        'loadActiveTheme',
        'loadThemeNames',
        'deleteTheme',
        'deactivateTheme',
        'loadTheme'
      ]);
      store.loadActiveTheme.and.callFake(() => of(theme));
      store.loadThemeNames.and.callFake(() => of([theme.name]));
      store.loadTheme.and.callFake(() => of(theme));
    });

    it('getActiveTheme should return other then element', (done: DoneFn) => {
      setupTestBed(false, store);
      service.getActiveTheme().subscribe(result => {
        expect(result).toBeDefined();
        expect(result!.name).toBe('example');
        done();
      });
    });

    it('deleteTheme with unknown theme should return false', (done: DoneFn) => {
      store.deleteTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      service.deleteTheme('any').subscribe(result => {
        expect(result).toBeFalse();
        expect(store.deleteTheme).not.toHaveBeenCalled();
        done();
      });
    });

    it('deleteTheme should call storage deleteTheme', (done: DoneFn) => {
      store.deleteTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe(result => {
        expect(result).toBeTrue();
        expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
        done();
      });
    });

    it('deleteTheme should return false on storage failures', (done: DoneFn) => {
      store.deleteTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe(result => {
        expect(result).toBeFalse();
        expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
        done();
      });
    });

    it('deleteTheme should return error on storage errors', (done: DoneFn) => {
      store.deleteTheme.and.callFake(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      service.deleteTheme(theme.name).subscribe({
        next: () => fail(),
        error: error => {
          expect(error).toBeDefined();
          expect(error).toBe('no network');
          done();
        }
      });
    });

    it('setActiveTheme with element should call deactive theme on storage', (done: DoneFn) => {
      store.deactivateTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBeTrue();
        expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('setActiveTheme should return false on theme on storage failure', (done: DoneFn) => {
      store.deactivateTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      expect(service.activeThemeName).toBe('example');
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBeFalse();
        expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('with custom inactive theme', () => {
    let theme: Theme;
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', [
        'loadActiveTheme',
        'loadThemeNames',
        'activateTheme',
        'loadTheme'
      ]);
      store.loadActiveTheme.and.callFake(() => of(undefined));
      store.loadThemeNames.and.callFake(() => of([theme.name]));
      store.activateTheme.and.callFake(() => of(true));
      store.loadTheme.and.callFake(() => of(theme));

      setupTestBed(false, store);
    });

    it('getTheme should return cached theme on second call', (done: DoneFn) => {
      service
        .getTheme('example')
        .pipe(switchMap(() => service.getTheme('example')))
        .subscribe(result => {
          expect(result).toBeDefined();
          expect(result!.name).toBe('example');
          expect(store.loadTheme).toHaveBeenCalledTimes(1);
          done();
        });
    });

    it('getTheme should load theme from store', (done: DoneFn) => {
      service.getTheme('example').subscribe(result => {
        expect(result).toBeDefined();
        expect(result!.name).toBe('example');
        done();
      });
    });

    it('setActiveTheme should invoke activateTheme on store', (done: DoneFn) => {
      service.setActiveTheme(theme.name).subscribe(result => {
        expect(result).toBeTrue();
        expect(store.activateTheme).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('setActiveTheme of current active theme should return true', (done: DoneFn) => {
      service.setActiveTheme(ELEMENT_THEME_NAME).subscribe(result => {
        expect(result).toBeTrue();
        expect(store.activateTheme).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });
});
