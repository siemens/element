/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiTabsLegacyModule } from '../si-tabs-legacy.module';
import { SiTabsetLegacyComponent } from './si-tabset-legacy.component';

@Component({
  imports: [SiTabsLegacyModule],
  template: `
    <div class="tab-wrapper">
      <si-tabset-legacy [tabButtonMaxWidth]="tabButtonMaxWidth()">
        @for (tab of tabsObject(); track tab) {
          <si-tab-legacy
            [heading]="tab.heading"
            [closable]="!!tab.closable"
            (closeTriggered)="closeTriggered(tab)"
          />
        }
      </si-tabset-legacy>
    </div>
  `,
  styles: `
    .tab-wrapper {
      width: 200px;
    }
  `
})
class TestComponent {
  readonly tabButtonMaxWidth = signal<number | undefined>(undefined);
  protected readonly tabsObject = signal<{ heading: string; closable?: boolean }[]>([]);

  set tabs(value: ({ heading: string; closable?: true } | string)[]) {
    this.tabsObject.set(value.map(tab => (typeof tab === 'string' ? { heading: tab } : tab)));
  }

  readonly tabSet = viewChild.required(SiTabsetLegacyComponent);

  closeTriggered(tab: { heading: string; hidden?: boolean }): void {
    this.tabsObject.update(tabs => tabs.filter(t => t !== tab));
  }
}

describe('SiTabset', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: SiTabsetLegacyComponent;
  let testComponent: TestComponent;

  const getLength = (): number =>
    fixture.nativeElement.querySelectorAll(`.tab-container-buttonbar-list > button`).length;
  const getHeading = (index: number): string =>
    fixture.nativeElement.querySelector(
      `.tab-container-buttonbar-list > button:nth-child(${index + 1}) .text-truncate`
    ).innerText;
  const getActive = (index: number): boolean =>
    !!fixture.nativeElement.querySelector(
      `.tab-container-buttonbar-list > button:nth-child(${index + 1}).active`
    );

  const getElement = (index: number): HTMLElement =>
    fixture.nativeElement.querySelector(
      `.tab-container-buttonbar-list > button:nth-child(${index + 1}`
    );

  const focusNext = (): void => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' })
    );
  };

  const focusPrevious = (): void => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft' })
    );
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    component = testComponent.tabSet();
  });

  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be possible to create a tabComponent instance', async () => {
    expect(getLength()).toEqual(0);

    testComponent.tabs = ['test'];
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    await fixture.whenStable();

    expect(getLength()).toEqual(1);
    expect(getHeading(0)).toBe('test');
    expect(getActive(0)).toBe(true);
  });

  it('should be possible to add a few tabs to the tabComponent', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    await fixture.whenStable();

    expect(getActive(0)).toBe(true);
    expect(getActive(1)).toBe(false);
    expect(getActive(2)).toBe(false);
    expect(getLength()).toEqual(3);
  });

  it('should be possible to select a tab', () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    getElement(1).click();

    fixture.detectChanges();

    expect(getActive(0)).toEqual(false);
    expect(getActive(1)).toEqual(true);
  });

  it('should remove tab on destroy', () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();
    expect(getLength()).toEqual(3);
    testComponent.tabs = [];
    fixture.detectChanges();
    expect(getLength()).toEqual(0);
  });

  it('should ignore tab selection with wrong input', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    await fixture.whenStable();

    expect(getActive(0)).toEqual(true);
    expect(component.selectedTabIndex).toEqual(0);
    component.selectedTabIndex = 2;
    expect(component.selectedTabIndex).toEqual(2);
    component.selectedTabIndex = -2;
    expect(component.selectedTabIndex).toEqual(2);
    component.selectedTabIndex = 5;
    expect(component.selectedTabIndex).toEqual(2);
  });

  it('should should emit selectedTabIndexChange event', async () => {
    vi.spyOn(component.selectedTabIndexChange, 'emit');
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    component.selectedTabIndex = 2;
    vi.advanceTimersByTime(1000);
    await fixture.whenStable();
    expect(component.selectedTabIndexChange.emit).toHaveBeenCalledTimes(2); // the first call is caused by adding the tabs
  });

  it('should scroll', () => {
    testComponent.tabs = ['Tab 1 name extender', 'Tab 1 name extender', 'Tab 1 name extender'];
    fixture.detectChanges();
    const preventDefault = vi.fn();

    fixture.debugElement
      .query(By.css('.tab-container-buttonbar'))
      .triggerEventHandler('wheel', { deltaY: 1, preventDefault });
    fixture.debugElement
      .query(By.css('.tab-container-buttonbar'))
      .triggerEventHandler('wheel', { deltaY: 1, preventDefault });
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('.tab-container-buttonbar-list')).styles.transform
    ).toEqual('translateX(-110px)');

    fixture.debugElement
      .query(By.css('.tab-container-buttonbar'))
      .triggerEventHandler('wheel', { deltaY: -1, preventDefault });
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('.tab-container-buttonbar-list')).styles.transform
    ).toEqual('translateX(-55px)');

    expect(preventDefault).toHaveBeenCalledTimes(3);
  });

  it('should handle focus correctly', async () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);
    await fixture.whenStable();
    if (document.hasFocus()) {
      getElement(0).focus();
      vi.advanceTimersByTime(1000);
      await fixture.whenStable();
      expect(getElement(0).getAttribute('tabindex')).toEqual('-1');
      focusNext();
      expect(document.activeElement).toBe(getElement(1));
      focusPrevious();
      expect(document.activeElement).toBe(getElement(0));
    }
  });

  it('should restore focus to active element when blurred', async () => {
    testComponent.tabs = ['1', '2'];
    fixture.detectChanges();
    await fixture.whenStable();
    if (document.hasFocus()) {
      getElement(0).focus();
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      focusNext();
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.activeElement).toBe(getElement(1));
      (document.activeElement! as HTMLElement).blur();
      vi.advanceTimersByTime(500);
      await fixture.whenStable();

      expect(getElement(0).getAttribute('tabindex')).toBe('0');
    }
  });

  it('should use defined tabButtonMaxWidth value', async () => {
    testComponent.tabButtonMaxWidth.set(110);
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();
    await fixture.whenStable();

    const d1 = getElement(0).getBoundingClientRect();
    expect(d1.width).toBeCloseTo(110);
    const d2 = getElement(1).getBoundingClientRect();
    expect(d2.width).toBeCloseTo(110);
  });

  it('should use nav-tabs min-inline-size', async () => {
    testComponent.tabButtonMaxWidth.set(90);
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();
    await fixture.whenStable();

    const d1 = getElement(0).getBoundingClientRect();
    expect(d1.width).toBeCloseTo(100);
    const d2 = getElement(1).getBoundingClientRect();
    expect(d2.width).toBeCloseTo(100);
  });

  it('should emit tab close event for closable tab and preserve active tab', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    const closeSpy = vi.spyOn(testComponent, 'closeTriggered');
    getElement(3).click();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();

    getElement(2).querySelector<HTMLElement>('si-icon[data-icon="elementCancel"]')!.click();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();

    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ heading: '3' }));
    expect(getElement(2)).toBe(document.activeElement);

    focusPrevious();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    expect(getElement(1)).toBe(document.activeElement);
  });

  it('should emit tab close event for closable tab and select next tab as active', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    const closeSpy = vi.spyOn(testComponent, 'closeTriggered');
    getElement(2).click();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    getElement(2).querySelector<HTMLElement>('si-icon[data-icon="elementCancel"]')!.click();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ heading: '3' }));
    expect(getElement(2)).toBe(document.activeElement);
    focusPrevious();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    expect(getElement(1)).toBe(document.activeElement);
  });

  it('should not display close icon for non closable tab', () => {
    testComponent.tabs = ['1', { heading: '2', closable: true }];
    fixture.detectChanges();
    let closeIcon = getElement(0).querySelector('si-icon[data-icon="elementCancel"]');
    fixture.detectChanges();
    expect(closeIcon).toBeFalsy();
    closeIcon = getElement(1).querySelector('si-icon[data-icon="elementCancel"]');
    fixture.detectChanges();
    expect(closeIcon).toBeTruthy();
  });
});
