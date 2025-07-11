/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal, viewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';

import { SiTabNextLinkComponent } from './si-tab-next-link.component';
import { SiTabNextComponent } from './si-tab-next.component';
import { SiTabsetNextComponent } from './si-tabset-next.component';
import { SiTabsetNextHarness } from './testing/si-tabset-next.harness';

@Component({
  selector: 'si-tab-route',
  template: `Content by routing`
})
class SiTabRouteComponent {}

@Component({
  imports: [SiTabsetNextComponent, SiTabNextComponent],
  template: `
    <div class="tab-wrapper" [style.width.px]="wrapperWidth()">
      @if (tabsObject().length) {
        <si-tabset-next>
          @for (tab of tabsObject(); track tab) {
            <si-tab-next
              [active]="$first"
              [heading]="tab.heading"
              [closable]="!!tab.closable"
              [style.max-width.px]="tabButtonMaxWidth()"
              (closeTriggered)="closeTriggered(tab)"
            />
          }
        </si-tabset-next>
      }
    </div>
  `
})
class TestComponent {
  readonly tabButtonMaxWidth = signal<number | undefined>(undefined);
  readonly wrapperWidth = signal(200);
  protected readonly tabsObject = signal<{ heading: string; closable?: boolean }[]>([]);

  set tabs(value: ({ heading: string; closable?: true; routerLinkUrl?: string } | string)[]) {
    this.tabsObject.set(
      value.map(tab => {
        if (typeof tab === 'string') {
          return { heading: tab };
        }
        {
          return tab;
        }
      })
    );
  }

  readonly tabSet = viewChild.required(SiTabsetNextComponent);

  closeTriggered(tab: { heading: string }): void {
    this.tabsObject.set(this.tabsObject().filter(t => t !== tab));
  }
}

@Component({
  imports: [SiTabsetNextComponent, SiTabNextLinkComponent, RouterOutlet, RouterLink],
  template: `
    <div class="tab-wrapper" [style.width.px]="wrapperWidth()">
      @if (tabsObject().length) {
        <si-tabset-next>
          @for (tab of tabsObject(); track tab) {
            <a
              si-tab-next
              aria-label="tab.heading"
              [heading]="tab.heading"
              [closable]="!!tab.closable"
              [routerLink]="tab.routerLinkUrl ?? ''"
              [style.max-width.px]="tabButtonMaxWidth()"
            ></a>
          }
          <router-outlet />
        </si-tabset-next>
      }
    </div>
  `
})
class TestRoutingComponent {
  readonly tabButtonMaxWidth = signal<number | undefined>(undefined);
  readonly wrapperWidth = signal(200);
  protected readonly tabsObject = signal<
    { heading: string; closable?: boolean; routerLinkUrl?: string }[]
  >([]);

  set tabs(value: ({ heading: string; closable?: true; routerLinkUrl?: string } | string)[]) {
    this.tabsObject.set(
      value.map(tab => {
        if (typeof tab === 'string') {
          return { heading: tab };
        }
        {
          return tab;
        }
      })
    );
  }

  readonly tabSet = viewChild.required(SiTabsetNextComponent);
}

describe('SiTabsetNext', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let loader: HarnessLoader;
  let tabsetHarness: SiTabsetNextHarness;

  const detectSizeChange = (): void => {
    fixture.detectChanges();
    tick();
    TestBed.inject(ResizeObserverService)._checkAll();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    tabsetHarness = await loader.getHarness(SiTabsetNextHarness);
  });

  it('should be possible to create a tabComponent instance', async () => {
    const tabs = await tabsetHarness.getTabItemsLength();
    expect(tabs).toEqual(0);

    testComponent.tabs = ['test'];
    fixture.detectChanges();

    const updatedTabs = await tabsetHarness.getTabItemsLength();

    expect(updatedTabs).toEqual(1);
    expect(await tabsetHarness.getTabItemHeadingAt(0)).toBe('test');
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
  });

  it('should be possible to add a few tabs to the tabComponent', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBeTrue();
    expect(await tabsetHarness.isTabItemActive(1)).toBeFalse();
    expect(await tabsetHarness.isTabItemActive(2)).toBeFalse();
    expect(await tabsetHarness.getTabItemsLength()).toEqual(3);
  });

  it('should be possible to select a tab', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    (await tabsetHarness.getTabItemButtonAt(1)).click();

    expect(await tabsetHarness.isTabItemActive(0)).toEqual(false);
    expect(await tabsetHarness.isTabItemActive(1)).toEqual(true);
  });

  it('should remove tab on destroy', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();
    expect(await tabsetHarness.getTabItemsLength()).toEqual(3);
    testComponent.tabs = [];
    fixture.detectChanges();
    expect(await tabsetHarness.getTabItemsLength()).toEqual(0);
  });

  it('should handle focus correctly', fakeAsync(async () => {
    testComponent.tabs = ['1', '2', '3'];
    testComponent.wrapperWidth.set(300);
    detectSizeChange();
    tick(10);
    flush();
    fixture.detectChanges();
    const button = await tabsetHarness.getTabItemButtonAt(0);
    await button.focus();
    fixture.detectChanges();
    await tabsetHarness.focusNext();
    fixture.detectChanges();
    expect(await (await tabsetHarness.getTabItemButtonAt(1)).isFocused()).toBe(true);
    await tabsetHarness.focusPrevious();
    fixture.detectChanges();
    expect(await (await tabsetHarness.getTabItemButtonAt(0)).isFocused()).toBe(true);
  }));

  it('should use defined tabButtonMaxWidth value', async () => {
    testComponent.tabButtonMaxWidth.set(110);
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();

    const d1 = await (await tabsetHarness.getTabItemButtonAt(0)).getDimensions();
    expect(d1.width).toBe(110);
  });

  it('should use nav-tabs min-inline-size', async () => {
    testComponent.tabButtonMaxWidth.set(90);
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();

    const d1 = await (await tabsetHarness.getTabItemButtonAt(0)).getDimensions();
    expect(d1.width).toBe(100);
    const d2 = await (await tabsetHarness.getTabItemButtonAt(1)).getDimensions();
    expect(d2.width).toBe(100);
  });

  it('should hide tabs which are not in the view and show menu button', fakeAsync(async () => {
    testComponent.tabButtonMaxWidth.set(90);
    testComponent.tabs = [
      { heading: 'Tab 1' },
      { heading: 'Tab 2' },
      { heading: 'Tab 3' },
      { heading: 'Tab 4' }
    ];
    testComponent.wrapperWidth.set(300);
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(3)).toBeFalse();
    expect(await tabsetHarness.getOptionsMenuButton()).toBeDefined();
    testComponent.wrapperWidth.set(500);
    detectSizeChange();
    fixture.detectChanges();
    tick(10);
    flush();
    expect(await tabsetHarness.getOptionsMenuButton()).toBeNull();
    expect(await tabsetHarness.isTabVisible(3)).toBeTrue();
  }));

  it('should emit tab close event for closable tab and preserve active tab', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    const closeSpy = spyOn(testComponent, 'closeTriggered').and.callThrough();
    (await tabsetHarness.getTabItemButtonAt(3)).click();

    (await tabsetHarness.getCloseButtonForTabAt(0)).click();
    fixture.detectChanges();
    expect(closeSpy).toHaveBeenCalledWith(jasmine.objectContaining({ heading: '3' }));
    expect(await (await tabsetHarness.getTabItemButtonAt(2)).getAttribute('tabindex')).toBe('0');
    await (await tabsetHarness.getTabItemButtonAt(2)).focus();
    await (
      await tabsetHarness.getTabItemButtonAt(2)
    ).dispatchEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft' });
    expect(await (await tabsetHarness.getTabItemButtonAt(1)).isFocused()).toBe(true);
  });

  it('should bring tab into visibile area if not visible on selection from menu', fakeAsync(async () => {
    testComponent.tabs = ['1', '2', '3', '4', '5'];
    testComponent.wrapperWidth.set(200);
    detectSizeChange();
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(4)).toBe(false);
    (await tabsetHarness.getOptionsMenuButton())?.click();
    (await tabsetHarness.getMenuItemAt(4)).click();
    expect(await (await tabsetHarness.getTabItemButtonAt(4)).hasClass('hidden')).toBe(false);
    expect(await (await tabsetHarness.getTabItemButtonAt(4)).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(await tabsetHarness.isTabVisible(0)).toBe(false);
  }));

  it('should delete tab on close and recaculate visisble tabs', async () => {
    testComponent.tabs = [
      {
        heading: '1',
        closable: true
      },
      '2',
      '3'
    ];
    fixture.detectChanges();

    expect(await tabsetHarness.isTabVisible(2)).toBe(false);
    expect(await tabsetHarness.getOptionsMenuButton()).toBeDefined();

    await (await tabsetHarness.getTabItemButtonAt(0)).click();
    await (await tabsetHarness.getTabItemButtonAt(0)).sendKeys(TestKey.DELETE);
    // Firefox requires a slight delay, otherwise resize Event is not triggered.
    await new Promise(resolve => setTimeout(resolve, 110));
    fixture.detectChanges();

    expect(await tabsetHarness.getOptionsMenuButton()).toBe(null);
    expect(await tabsetHarness.isTabVisible(1)).toBe(true);
  });
});

describe('SiTabsetNext Routing', () => {
  let fixture: ComponentFixture<TestRoutingComponent>;
  let testComponent: TestRoutingComponent;
  let loader: HarnessLoader;
  let tabsetHarness: SiTabsetNextHarness;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestRoutingComponent, SiTabRouteComponent],
      providers: [
        provideRouter([
          {
            path: 'tab-route',
            component: SiTabRouteComponent
          }
        ])
      ]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestRoutingComponent);
    testComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    tabsetHarness = await loader.getHarness(SiTabsetNextHarness);
  });

  it('should render router link tab', fakeAsync(async () => {
    testComponent.tabs = [
      '1',
      {
        heading: '2',
        routerLinkUrl: 'tab-route'
      }
    ];
    fixture.detectChanges();
    (await tabsetHarness.getTabItemButtonAt(1)).click();
    tick(100);
    fixture.detectChanges();
    expect(await (await tabsetHarness.getTabContent()).text()).toBe('Content by routing');
  }));
});
