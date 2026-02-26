/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../resize-observer/mock-resize-observer.spec';
import { SiTabContentComponent } from './si-tab-content.component';
import { SiTabLinkComponent } from './si-tab-link.component';
import { SiTabComponent } from './si-tab.component';
import { SiTabsetComponent } from './si-tabset.component';
import { SiTabsetHarness } from './testing/si-tabset.harness';

interface TabData {
  heading: string;
  closable?: true;
  routerLinkUrl?: string;
  active?: boolean;
  canDeactivate?: () => boolean;
  canActivate?: () => boolean;
}

@Component({
  selector: 'si-tab-route',
  template: `Content by routing`
})
class SiTabRouteComponent {}

@Component({
  imports: [SiTabsetComponent, SiTabComponent],
  template: `
    <div class="tab-wrapper" [style.width.px]="wrapperWidth()">
      @if (tabsObject().length) {
        <si-tabset>
          @for (tab of tabsObject(); track tab) {
            <si-tab
              [active]="tab.active ?? false"
              [heading]="tab.heading"
              [closable]="!!tab.closable"
              [style.max-width.px]="tabButtonMaxWidth()"
              [canDeactivate]="tab.canDeactivate"
              [canActivate]="tab.canActivate"
              (closeTriggered)="closeTriggered(tab)"
            />
          }
        </si-tabset>
      }
    </div>
  `
})
class TestComponent {
  readonly tabButtonMaxWidth = signal<number | undefined>(undefined);
  readonly wrapperWidth = signal(200);
  protected readonly tabsObject = signal<TabData[]>([]);

  set tabs(value: (TabData | string)[]) {
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

  readonly tabSet = viewChild.required(SiTabsetComponent);

  closeTriggered(tab: { heading: string }): void {
    this.tabsObject.set(this.tabsObject().filter(t => t !== tab));
  }
}

@Component({
  imports: [SiTabsetComponent, SiTabLinkComponent, RouterOutlet, RouterLink],
  template: `
    <div class="tab-wrapper" [style.width.px]="wrapperWidth()">
      @if (tabsObject().length) {
        <si-tabset>
          @for (tab of tabsObject(); track tab) {
            <a
              si-tab
              aria-label="tab.heading"
              [heading]="tab.heading"
              [closable]="!!tab.closable"
              [routerLink]="tab.routerLinkUrl ?? ''"
              [style.max-width.px]="tabButtonMaxWidth()"
            ></a>
          }
          <router-outlet />
        </si-tabset>
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

  readonly tabSet = viewChild.required(SiTabsetComponent);
}

describe('SiTabset', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let loader: HarnessLoader;
  let tabsetHarness: SiTabsetHarness;

  const detectSizeChange = (): void => {
    fixture.detectChanges();
    MockResizeObserver.triggerResize({});
    jasmine.clock().tick(200);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    tabsetHarness = await loader.getHarness(SiTabsetHarness);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  beforeEach(() => jasmine.clock().install());

  afterEach(() => {
    restoreResizeObserver();
    jasmine.clock().uninstall();
  });

  it('should be possible to create a tabComponent instance', async () => {
    const tabs = await tabsetHarness.getTabItemsLength();
    expect(tabs).toEqual(0);

    testComponent.tabs = [{ heading: 'test', active: true }];
    fixture.detectChanges();

    const updatedTabs = await tabsetHarness.getTabItemsLength();

    expect(updatedTabs).toEqual(1);
    expect(await tabsetHarness.getTabItemHeadingAt(0)).toBe('test');
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
  });

  it('should be possible to add a few tabs to the tabComponent', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, '2', '3'];
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(false);
    expect(await tabsetHarness.isTabItemActive(2)).toBe(false);
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

  it('should handle focus correctly', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, '2', '3'];
    testComponent.wrapperWidth.set(300);
    detectSizeChange();
    jasmine.clock().tick(10);
    fixture.detectChanges();
    const button = await tabsetHarness.getTabItemButtonAt(0);
    await button.focus();
    jasmine.clock().tick(10);
    fixture.detectChanges();
    await tabsetHarness.focusNext();
    jasmine.clock().tick(10);
    fixture.detectChanges();

    expect(await (await tabsetHarness.getTabItemButtonAt(1)).isFocused()).toBe(true);
    await tabsetHarness.focusPrevious();

    fixture.detectChanges();
    expect(await (await tabsetHarness.getTabItemButtonAt(0)).isFocused()).toBe(true);
  });

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

  it('should hide tabs which are not in the view and show menu button', async () => {
    testComponent.tabButtonMaxWidth.set(90);
    testComponent.tabs = [
      { heading: 'Tab 1' },
      { heading: 'Tab 2' },
      { heading: 'Tab 3' },
      { heading: 'Tab 4' }
    ];
    testComponent.wrapperWidth.set(300);
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(3)).toBe(false);
    expect(await tabsetHarness.getOptionsMenuButton()).toBeDefined();
    testComponent.wrapperWidth.set(500);
    detectSizeChange();
    fixture.detectChanges();
    jasmine.clock().tick(10);
    expect(await tabsetHarness.getOptionsMenuButton()).toBeNull();
    expect(await tabsetHarness.isTabVisible(3)).toBe(true);
  });

  it('should always scroll active tab into view', async () => {
    testComponent.tabButtonMaxWidth.set(90);
    const tabs = [
      { heading: 'Tab 1' },
      { heading: 'Tab 2' },
      { heading: 'Tab 3' },
      { heading: 'Tab 4' },
      { heading: 'Tab 5' },
      { heading: 'Tab 6' },
      { heading: 'Tab 7', active: true }
    ];
    testComponent.tabs = tabs;
    jasmine.clock().tick(100);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    testComponent.wrapperWidth.set(300);
    jasmine.clock().tick(100);

    fixture.detectChanges();
    expect(await tabsetHarness.getOptionsMenuButton()).toBeDefined();
    expect(await tabsetHarness.isTabVisible(6)).toBe(true);
    expect(await tabsetHarness.isTabVisible(0)).toBe(false);

    tabs[0].active = true;
    tabs[6].active = false;
    fixture.changeDetectorRef.markForCheck();
    // need to tick twice to allow for scrollIntoView to complete
    jasmine.clock().tick(0);
    fixture.detectChanges();

    jasmine.clock().tick(0);
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(0)).toBe(true);
    expect(await tabsetHarness.isTabVisible(6)).toBe(false);
  });

  it('should emit tab close event for closable tab and preserve active tab', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    const closeSpy = spyOn(testComponent, 'closeTriggered').and.callThrough();
    await (await tabsetHarness.getTabItemButtonAt(3)).click();
    await (await tabsetHarness.getCloseButtonForTabAt(0)).click();
    expect(closeSpy).toHaveBeenCalledWith(jasmine.objectContaining({ heading: '3' }));
    expect(await (await tabsetHarness.getTabItemButtonAt(2)).getAttribute('tabindex')).toBe('0');
    await (await tabsetHarness.getTabItemButtonAt(2)).focus();
    await tabsetHarness.pressArrowLeft();
    expect(await (await tabsetHarness.getTabItemButtonAt(1)).isFocused()).toBe(true);
  });

  it('should bring tab into visibile area if not visible on selection from menu', async () => {
    testComponent.tabs = ['1', '2', '3', '4', '5'];
    testComponent.wrapperWidth.set(200);
    detectSizeChange();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(4)).toBe(false);
    (await tabsetHarness.getOptionsMenuButton())?.click();
    (await tabsetHarness.getMenuItemAt(4)).click();
    expect(await (await tabsetHarness.getTabItemButtonAt(4)).hasClass('hidden')).toBe(false);
    expect(await (await tabsetHarness.getTabItemButtonAt(4)).getAttribute('aria-selected')).toBe(
      'true'
    );
    jasmine.clock().tick(0);
    fixture.detectChanges();
    expect(await tabsetHarness.isTabVisible(0)).toBe(false);
  });

  it('should delete tab on close and recalculate visible tabs', async () => {
    testComponent.tabs = [
      {
        heading: '1',
        closable: true
      },
      '2',
      '3'
    ];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(await tabsetHarness.isTabVisible(2)).toBe(false);
    expect(await tabsetHarness.getOptionsMenuButton()).toBeDefined();

    await (await tabsetHarness.getTabItemButtonAt(0)).click();
    await (await tabsetHarness.getTabItemButtonAt(0)).sendKeys(TestKey.DELETE);
    detectSizeChange();

    fixture.detectChanges();

    expect(await tabsetHarness.getOptionsMenuButton()).toBe(null);
    expect(await tabsetHarness.isTabVisible(1)).toBe(true);
  });

  it('should mark active tab as focussable after delayed adding', async () => {
    testComponent.tabs = [];
    fixture.detectChanges();
    testComponent.tabs = ['1', { heading: '2', active: true }, '3'];
    expect(await tabsetHarness.isTabFocussable(1)).toBe(true);
  });

  it('should not change active if canDeactivate returns false', async () => {
    testComponent.tabs = [
      { heading: '1', active: true },
      { heading: '2', closable: true, canDeactivate: () => false }
    ];
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(false);

    (await tabsetHarness.getTabItemButtonAt(1)).click();
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(false);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(true);

    (await tabsetHarness.getTabItemButtonAt(0)).click();
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(false);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(true);
  });

  it('should not change active if canActivate returns false', async () => {
    testComponent.tabs = [
      { heading: '1', active: true },
      { heading: '2', closable: true, canActivate: () => false }
    ];
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(false);

    (await tabsetHarness.getTabItemButtonAt(1)).click();
    fixture.detectChanges();
    expect(await tabsetHarness.isTabItemActive(0)).toBe(true);
    expect(await tabsetHarness.isTabItemActive(1)).toBe(false);
  });
});

describe('SiTabset Routing', () => {
  let fixture: ComponentFixture<TestRoutingComponent>;
  let testComponent: TestRoutingComponent;
  let loader: HarnessLoader;
  let tabsetHarness: SiTabsetHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestRoutingComponent);
    testComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    tabsetHarness = await loader.getHarness(SiTabsetHarness);
  });

  beforeEach(() => jasmine.clock().install());

  afterEach(() => jasmine.clock().uninstall());

  it('should render router link tab', async () => {
    testComponent.tabs = [
      '1',
      {
        heading: '2',
        routerLinkUrl: 'tab-route'
      }
    ];
    fixture.detectChanges();
    (await tabsetHarness.getTabItemButtonAt(1)).click();
    jasmine.clock().tick(100);
    fixture.detectChanges();
    expect(await (await tabsetHarness.getTabContent()).text()).toBe('Content by routing');
  });
});

describe('SiTabset with external content', () => {
  @Component({
    imports: [SiTabsetComponent, SiTabComponent, SiTabContentComponent],
    template: `
      <div class="tab-wrapper">
        <si-tabset #tabset [content]="tabContent">
          @for (tab of tabsObject(); track tab) {
            <si-tab
              [active]="tab.active ?? false"
              [heading]="tab.heading"
              [disabled]="!!tab.disabled"
            />
          }
        </si-tabset>

        <si-tab-content #tabContent>
          <div class="external-content">External content is rendered</div>
        </si-tab-content>
      </div>
    `
  })
  class TestExternalContentComponent {
    protected readonly tabsObject = signal<
      { heading: string; active?: boolean; disabled?: boolean }[]
    >([]);

    set tabs(value: { heading: string; active?: boolean; disabled?: boolean }[]) {
      this.tabsObject.set(value);
    }

    readonly tabSet = viewChild.required(SiTabsetComponent);
  }

  let fixture: ComponentFixture<TestExternalContentComponent>;
  let testComponent: TestExternalContentComponent;
  let loader: HarnessLoader;
  let tabsetHarness: SiTabsetHarness;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestExternalContentComponent);
    testComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    tabsetHarness = await loader.getHarness(SiTabsetHarness);
  });

  it('should not render tabpanel via content-projection', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }];
    fixture.detectChanges();

    const internalTabpanel = fixture.nativeElement.querySelector('si-tabset [role="tabpanel"]');
    expect(internalTabpanel).toBeNull();
  });

  it('should set correct role="tabpanel" on external content', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }];
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    const tabPanel = await contentHarness!.getTabPanel();
    expect(tabPanel).toBeTruthy();
  });

  it('should link tabpanel aria-labelledby to the active tab id', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }];
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    const activeTabId = await tabsetHarness.getActiveTabId();
    expect(await contentHarness!.getTabPanelLabelledBy()).toBe(activeTabId);
  });

  it('should set tabpanel id matching the active tab aria-controls', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }];
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    const ariaControls = await tabsetHarness.getActiveTabAriaControls();
    expect(await contentHarness!.getTabPanelId()).toBe(ariaControls);
  });

  it('should update ARIA attributes when switching tabs', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }];
    fixture.detectChanges();

    // Click second tab
    await (await tabsetHarness.getTabItemButtonAt(1)).click();
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    const activeTabId = await tabsetHarness.getActiveTabId();
    const ariaControls = await tabsetHarness.getActiveTabAriaControls();

    expect(await tabsetHarness.isTabItemActive(1)).toBe(true);
    expect(await contentHarness!.getTabPanelLabelledBy()).toBe(activeTabId);
    expect(await contentHarness!.getTabPanelId()).toBe(ariaControls);
  });

  it('should render projected content inside external tabpanel', async () => {
    testComponent.tabs = [{ heading: '1', active: true }];
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    expect(await contentHarness!.getTabPanelText()).toContain('External content is rendered');
  });

  it('should not render external tabpanel when no tab is active', async () => {
    testComponent.tabs = [{ heading: '1' }, { heading: '2' }];
    fixture.detectChanges();

    const contentHarness = await tabsetHarness.getExternalTabContent();
    expect(await contentHarness!.hasTabPanel()).toBe(false);
  });

  it('should expose activeIndex matching the active tab position', async () => {
    testComponent.tabs = [{ heading: '1', active: true }, { heading: '2' }, { heading: '3' }];
    fixture.detectChanges();

    expect(testComponent.tabSet().activeIndex()).toBe(0);

    // Click third tab
    await (await tabsetHarness.getTabItemButtonAt(2)).click();
    fixture.detectChanges();

    expect(testComponent.tabSet().activeIndex()).toBe(2);
  });

  it('should set activeIndex to -1 when no tab is active', () => {
    testComponent.tabs = [{ heading: '1' }, { heading: '2' }];
    fixture.detectChanges();

    expect(testComponent.tabSet().activeIndex()).toBe(-1);
  });
});
