/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideLocationMocks } from '@angular/common/testing';
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SiNavbarPrimaryComponent } from '.';
import { SiApplicationHeaderHarness } from '../../application-header/testing/si-application-header.harness';
import { AppItem, AppItemCategory } from './si-navbar-primary.model';

const appItems: AppItem[] = [{ title: 'Account', icon: 'element-account', link: '/account' }];
const categorizedAppItems: AppItemCategory[] = [
  {
    category: 'Test category',
    items: [{ title: 'Account', icon: 'element-account', link: '/account' }]
  }
];

describe('SiNavbarPrimaryComponent', () => {
  let fixture: ComponentFixture<SiNavbarPrimaryComponent>;
  let appItemsInput: ReturnType<typeof signal<AppItem[] | undefined>>;
  let categorizedAppItemsInput: ReturnType<typeof signal<AppItemCategory[] | undefined>>;
  let harness: SiApplicationHeaderHarness;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideLocationMocks()]
    })
  );

  beforeEach(async () => {
    appItemsInput = signal<AppItem[] | undefined>(undefined);
    categorizedAppItemsInput = signal<AppItemCategory[] | undefined>(undefined);
    fixture = TestBed.createComponent(SiNavbarPrimaryComponent, {
      bindings: [
        inputBinding('appItems', appItemsInput),
        inputBinding('appCategoryItems', categorizedAppItemsInput)
      ]
    });
    harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      SiApplicationHeaderHarness
    );
  });

  it('should not render the launchpad trigger without app items', async () => {
    expect(await harness.hasLaunchpad()).toBe(false);
  });

  it('should render render launchpad with categories', async () => {
    categorizedAppItemsInput.set(categorizedAppItems);
    await fixture.whenStable();
    await harness.openLaunchpad();
    expect(
      await harness
        .getLaunchpad()
        .then(lp => lp?.getCategories())
        .then(categories => categories![0].getName())
    ).toEqual('Test category');
  });

  it('should render render launchpad without categories', async () => {
    appItemsInput.set(appItems);
    await fixture.whenStable();
    await harness.openLaunchpad();
    expect(await harness.getLaunchpad().then(lp => lp?.getApp('Account'))).toBeTruthy();
  });
});
