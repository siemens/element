/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadHarness } from '../testing/si-launchpad.harness';
import { FavoriteChangeEvent, SiLaunchpadFactoryComponent } from './si-launchpad-factory.component';
import { App, AppCategory } from './si-launchpad.model';

describe('SiLaunchpad', () => {
  @Component({
    imports: [SiLaunchpadFactoryComponent],
    template: `<si-launchpad-factory
      [enableFavorites]="enableFavorites"
      [apps]="apps"
      (favoriteChange)="favoriteChange($event)"
    />`
  })
  class TestHostComponent {
    apps: App[] | AppCategory[] = [];
    enableFavorites = false;

    favoriteChange(change: FavoriteChangeEvent): void {}
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let harness: SiLaunchpadHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: SiApplicationHeaderComponent, useValue: {} }]
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(SiLaunchpadHarness);
  });

  describe('with favorites', () => {
    beforeEach(() => {
      fixture.componentInstance.enableFavorites = true;
    });

    describe('with categories', () => {
      it('have a toggle button and section titles', async () => {
        fixture.componentInstance.apps = [
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1', favorite: true },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ];

        expect(await harness.hasToggle()).toBeTrue();
        expect(await harness.getCategories()).toHaveSize(1);
        await harness.toggleMore();
        expect(await harness.getCategories()).toHaveSize(2);
        expect(await harness.getCategory('C-1').then(category => category.getApps())).toHaveSize(2);
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
      });

      it('should fire favoriteChanged event when favorite is toggled', async () => {
        const favoriteChangeSpy = spyOn(fixture.componentInstance, 'favoriteChange');
        fixture.componentInstance.apps = [
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1', favorite: true },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ];
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
        fixture.componentInstance.apps = [
          { name: 'A-1', href: '/a-1', favorite: true },
          { name: 'A-2', href: '/a-2' }
        ];

        await harness.toggleMore();
        const categories = await harness.getCategories();
        expect(categories).toHaveSize(2);
        expect(await categories[0].getName()).toBe('Favorite apps');
        expect(await categories[1].getName()).toBe(null);
        expect(await harness.getApp('A-1').then(app => app.isFavorite())).toBeTrue();
        expect(await harness.getFavoriteCategory().then(category => category.getApps())).toHaveSize(
          1
        );
      });
    });
  });

  describe('without favorites', () => {
    describe('with categories', () => {
      it('have no toggle button but section titles', async () => {
        fixture.componentInstance.apps = [
          {
            name: 'C-1',
            apps: [
              { name: 'A-1', href: '/a-1' },
              { name: 'A-2', href: '/a-2' }
            ]
          }
        ];

        expect(await harness.hasToggle()).toBeFalse();
        expect(await harness.getCategories()).toHaveSize(1);
      });
    });

    describe('without categories', () => {
      it('have no toggle button and no section titles', async () => {
        fixture.componentInstance.apps = [
          { name: 'A-1', href: '/a-1' },
          { name: 'A-2', href: '/a-2' }
        ];
        expect(await harness.hasToggle()).toBeFalse();
      });
    });
  });
});
