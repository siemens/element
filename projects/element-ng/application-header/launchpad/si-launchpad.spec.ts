/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadHarness } from '../testing/si-launchpad.harness';
import { FavoriteChangeEvent, SiLaunchpadFactoryComponent } from './si-launchpad-factory.component';
import { App, AppCategory } from './si-launchpad.model';

describe('SiLaunchpad', () => {
  let fixture: ComponentFixture<SiLaunchpadFactoryComponent>;
  let harness: SiLaunchpadHarness;
  const apps = signal<App[] | AppCategory[]>([]);
  const enableFavorites = signal(false);
  const favoriteChangeSpy =
    jasmine.createSpy<(event: FavoriteChangeEvent) => void>('favoriteChange');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SiApplicationHeaderComponent, useValue: {} }]
    });
  });

  beforeEach(async () => {
    apps.set([]);
    enableFavorites.set(false);
    favoriteChangeSpy.calls.reset();
    fixture = TestBed.createComponent(SiLaunchpadFactoryComponent, {
      bindings: [
        inputBinding('apps', apps),
        inputBinding('enableFavorites', enableFavorites),
        outputBinding<FavoriteChangeEvent>('favoriteChange', favoriteChangeSpy)
      ]
    });
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SiLaunchpadHarness);
  });

  describe('with favorites', () => {
    beforeEach(() => {
      enableFavorites.set(true);
    });

    describe('with categories', () => {
      it('have a toggle button and section titles', async () => {
        apps.set([
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1', favorite: true },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ]);
        expect(await harness.hasToggle()).toBe(true);
        expect(await harness.getCategories()).toHaveSize(1);
        await harness.toggleMore();
        expect(await harness.getCategories()).toHaveSize(2);
        expect(await harness.getCategory('C-1').then(category => category.getApps())).toHaveSize(2);
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
      });

      it('should fire favoriteChanged event when favorite is toggled', async () => {
        apps.set([
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1', favorite: true },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ]);
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
        await harness.toggleMore();
        await harness
          .getCategory('C-1')
          .then(category => category.getApp('A-2'))
          .then(app => app.toggleFavorite());
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
        expect(favoriteChangeSpy).toHaveBeenCalledWith({
          app: { name: 'A-2', href: '/a-2' },
          favorite: true
        });
      });
    });

    describe('without categories', () => {
      it('have a toggle button and section and only a favorite section title', async () => {
        apps.set([
          { name: 'A-1', href: '/a-1', favorite: true },
          { name: 'A-2', href: '/a-2' }
        ]);
        await harness.toggleMore();
        const categories = await harness.getCategories();
        expect(categories).toHaveSize(2);
        expect(await categories[0].getName()).toBe('Favorites');
        expect(await categories[1].getName()).toBe(null);
        expect(await harness.getApp('A-1').then(app => app.isFavorite())).toBe(true);
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
      });
    });
  });

  describe('without favorites', () => {
    describe('with categories', () => {
      it('have no toggle button but section titles', async () => {
        apps.set([
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1' },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ]);
        expect(await harness.hasToggle()).toBe(false);
        expect(await harness.getCategories()).toHaveSize(1);
      });
    });

    describe('without categories', () => {
      it('have no toggle button and no section titles', async () => {
        apps.set([
          { name: 'A-1', href: '/a-1' },
          { name: 'A-2', href: '/a-2' }
        ]);
        expect(await harness.hasToggle()).toBe(false);
      });
    });
  });
});
