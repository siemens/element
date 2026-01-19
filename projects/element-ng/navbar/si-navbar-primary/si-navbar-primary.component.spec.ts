/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, HostBinding, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiApplicationHeaderHarness } from '@siemens/element-ng/application-header/testing/si-application-header.harness';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import { SiNavbarPrimaryComponent, SiNavbarPrimaryComponent as TestComponent } from '.';
import { AppItem, AppItemCategory } from './si-navbar-primary.model';

const appItems: AppItem[] = [{ title: 'Account', icon: 'element-account', link: '/account' }];
const categorizedAppItems: AppItemCategory[] = [
  {
    category: 'Test category',
    items: [{ title: 'Account', icon: 'element-account', link: '/account' }]
  }
];

@Component({
  imports: [SiNavbarPrimaryComponent],
  template: ` <si-navbar-primary [appItems]="appItems" [appCategoryItems]="categorizedAppItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestHostComponent {
  readonly component = viewChild.required(TestComponent);
  @HostBinding('class.mobile') fakeMobile = false;
  appItems?: AppItem[];
  categorizedAppItems?: AppItemCategory[];
}

describe('SiNavbarPrimaryComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let harness: SiApplicationHeaderHarness;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([]), provideLocationMocks()]
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      SiApplicationHeaderHarness
    );
  });

  it('should not render the launchpad trigger without app items', async () => {
    expect(await harness.hasLaunchpad()).toBeFalse();
  });

  it('should render render launchpad with categories', async () => {
    hostComponent.categorizedAppItems = categorizedAppItems;
    await runOnPushChangeDetection(fixture);
    await harness.openLaunchpad();
    expect(
      await harness
        .getLaunchpad()
        .then(lp => lp?.getCategories())
        .then(categories => categories![0].getName())
    ).toEqual('Test category');
  });

  it('should render render launchpad without categories', async () => {
    hostComponent.appItems = appItems;
    await runOnPushChangeDetection(fixture);
    await harness.openLaunchpad();
    expect(await harness.getLaunchpad().then(lp => lp?.getApp('Account'))).toBeTruthy();
  });
});
