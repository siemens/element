/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ModifierKeys, TestElement, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../../resize-observer/testing/resize-observer.mock';
import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadCategoryHarness } from '../testing/si-launchpad-category.harness';
import { SiLaunchpadCategoryComponent } from './si-launchpad-category.component';
import { App, AppCategory, FavoriteChangeEvent } from './si-launchpad.model';

describe('SiLaunchpadCategoryComponent', () => {
  let fixture: ComponentFixture<SiLaunchpadCategoryComponent>;
  let harness: SiLaunchpadCategoryHarness;
  const apps: App[] = ['A-1', 'A-2', 'A-3', 'A-4'].map(name => ({ name, href: `/${name}` }));
  const category = signal<AppCategory>({ name: 'C-1', apps });
  const enableFavorites = signal(false);
  const favoriteChangeSpy = vi.fn();

  const getApp = (name: string): Promise<TestElement> =>
    harness.getApp(name).then(app => app.host());

  const pressKey = (name: string, key: TestKey, modifiers: ModifierKeys = {}): Promise<void> =>
    getApp(name).then(app => app.sendKeys(modifiers, key));

  const getFocusedApp = async (): Promise<string | undefined> => {
    for (const app of await harness.getApps()) {
      if (await app.host().then(host => host.isFocused())) {
        return app.getName();
      }
    }
    return undefined;
  };

  /** Resizes the category, so that exactly the given number of apps fit into one row. */
  const setColumns = async (columns: number): Promise<void> => {
    const { width } = await getApp('A-1').then(app => app.getDimensions());
    fixture.nativeElement.style.width = `${(columns + 0.5) * width}px`;
    MockResizeObserver.triggerResize({});
    // The resize observer service emits asynchronously.
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    mockResizeObserver();
    TestBed.configureTestingModule({
      providers: [{ provide: SiApplicationHeaderComponent, useValue: {} }]
    });
    category.set({ name: 'C-1', apps });
    enableFavorites.set(false);
    favoriteChangeSpy.mockClear();
    fixture = TestBed.createComponent(SiLaunchpadCategoryComponent, {
      bindings: [
        inputBinding('category', category),
        inputBinding('enableFavorites', enableFavorites),
        outputBinding<FavoriteChangeEvent>('favoriteChange', favoriteChangeSpy)
      ]
    });
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SiLaunchpadCategoryHarness
    );
  });

  afterEach(() => restoreResizeObserver());

  describe('keyboard navigation', () => {
    beforeEach(async () => {
      // Rows: [A-1, A-2], [A-3, A-4]
      await setColumns(2);
    });

    it('should move focus to the next and previous app with arrow right and left', async () => {
      await pressKey('A-1', TestKey.RIGHT_ARROW);
      expect(await getFocusedApp()).toBe('A-2');

      await pressKey('A-2', TestKey.RIGHT_ARROW);
      expect(await getFocusedApp()).toBe('A-3');

      await pressKey('A-3', TestKey.LEFT_ARROW);
      expect(await getFocusedApp()).toBe('A-2');
    });

    it('should move focus to the app below and above with arrow down and up', async () => {
      await pressKey('A-1', TestKey.DOWN_ARROW);
      expect(await getFocusedApp()).toBe('A-3');

      await pressKey('A-3', TestKey.UP_ARROW);
      expect(await getFocusedApp()).toBe('A-1');
    });

    it('should move focus to the first and last app of the row with home and end', async () => {
      await pressKey('A-3', TestKey.END);
      expect(await getFocusedApp()).toBe('A-4');

      await pressKey('A-4', TestKey.HOME);
      expect(await getFocusedApp()).toBe('A-3');
    });

    it('should move focus to the first and last app with control + home and end', async () => {
      await pressKey('A-1', TestKey.END, { control: true });
      expect(await getFocusedApp()).toBe('A-4');

      await pressKey('A-4', TestKey.HOME, { control: true });
      expect(await getFocusedApp()).toBe('A-1');
    });
  });

  it('should keep the focus on the same app when the apps are rearranged', async () => {
    // Rows: [A-1, A-2, A-3], [A-4]
    await setColumns(3);
    await getApp('A-3').then(app => app.focus());

    // Rows: [A-1], [A-2], [A-3], [A-4]
    await setColumns(1);
    expect(await getFocusedApp()).toBe('A-3');
  });

  it('should toggle the favorite state with space', async () => {
    enableFavorites.set(true);
    await getApp('A-1').then(app => app.sendKeys(' '));
    expect(favoriteChangeSpy).toHaveBeenCalledWith({ app: apps[0], favorite: true });
  });
});
