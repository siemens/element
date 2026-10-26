/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadHarness } from '../testing/si-launchpad.harness';
import { SiLaunchpadFactoryComponent } from './si-launchpad-factory.component';
import { App, AppCategory, FavoriteChangeEvent } from './si-launchpad.model';

describe('SiLaunchpad', () => {
  let fixture: ComponentFixture<SiLaunchpadFactoryComponent>;
  let harness: SiLaunchpadHarness;
  const apps = signal<App[] | AppCategory[]>([]);
  const enableFavorites = signal(false);
  const favoriteChangeSpy = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SiApplicationHeaderComponent, useValue: {} }]
    });
  });

  beforeEach(async () => {
    apps.set([]);
    enableFavorites.set(false);
    favoriteChangeSpy.mockClear();
    fixture = TestBed.createComponent(SiLaunchpadFactoryComponent, {
      bindings: [
        inputBinding('apps', apps),
        inputBinding('enableFavorites', enableFavorites),
        outputBinding<FavoriteChangeEvent>('favoriteChange', favoriteChangeSpy)
      ]
    });
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SiLaunchpadHarness);
  });

  it('shows both labels on focus when either the name or system name is truncated', async () => {
    const longName = 'Application name that is too long to fit in a launchpad tile';
    const longSystemName = 'System name that is too long to fit in a launchpad tile';
    apps.set([
      { name: longName, systemName: 'System', href: '/name' },
      { name: 'App', systemName: longSystemName, href: '/system' }
    ]);
    await fixture.whenStable();
    const nameLink = page.getByRole('link', { name: `${longName} System`, exact: true }).element();
    const systemLink = page
      .getByRole('link', { name: `App ${longSystemName}`, exact: true })
      .element();

    nameLink.focus();
    await fixture.whenStable();

    await expect
      .element(page.getByRole('tooltip').getByText(longName, { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole('tooltip').getByText('System', { exact: true }))
      .toBeVisible();

    systemLink.focus();
    await fixture.whenStable();

    await expect.element(page.getByRole('tooltip').getByText('App', { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('tooltip').getByText(longSystemName, { exact: true }))
      .toBeVisible();
  });

  it('does not show a tooltip on focus when both labels fit', async () => {
    apps.set([{ name: 'App', systemName: 'System', href: '/app' }]);
    await fixture.whenStable();
    const link = page.getByRole('link', { name: 'App System', exact: true }).element();

    link.focus();
    await fixture.whenStable();

    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
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
        expect(await harness.isExpanded()).toBe(false);
        const controlledRegionId = await harness.getControlledRegionId();
        expect(controlledRegionId).not.toBeNull();
        expect(fixture.nativeElement.querySelector(`#${controlledRegionId}`)).toBeInTheDocument();
        expect(await harness.getCategories()).toHaveLength(1);
        await harness.toggleMore();
        expect(await harness.isExpanded()).toBe(true);
        expect(await harness.getCategories()).toHaveLength(2);
        expect(await harness.getCategory('C-1').then(category => category.getApps())).toHaveLength(
          2
        );
        expect(
          await harness.getFavoriteCategory().then(category => category.getApps())
        ).toHaveLength(1);
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
        expect(
          await harness.getFavoriteCategory().then(category => category.getApps())
        ).toHaveLength(1);
        await harness.toggleMore();
        await harness
          .getCategory('C-1')
          .then(category => category.getApp('A-2'))
          .then(app => app.toggleFavorite());
        expect(
          await harness.getFavoriteCategory().then(category => category.getApps())
        ).toHaveLength(1);
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
        expect(categories).toHaveLength(2);
        expect(await categories[0].getName()).toBe('Favorites');
        expect(await categories[1].getName()).toBe(null);
        expect(await harness.getApp('A-1').then(app => app.isFavorite())).toBe(true);
        expect(
          await harness.getFavoriteCategory().then(category => category.getApps())
        ).toHaveLength(1);
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
        expect(await harness.getCategories()).toHaveLength(1);
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
