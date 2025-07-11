/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, DebugElement, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiTabsModule } from '../si-tabs.module';
import { SiTabsetComponent } from './si-tabset.component';

@Component({
  imports: [SiTabsModule],
  template: `
    <div class="tab-wrapper">
      <si-tabset [tabButtonMaxWidth]="tabButtonMaxWidth">
        @for (tab of tabsObject; track tab) {
          <si-tab
            [heading]="tab.heading"
            [closable]="!!tab.closable"
            (closeTriggered)="closeTriggered(tab)"
          />
        }
      </si-tabset>
    </div>
  `,
  styles: `
    .tab-wrapper {
      width: 200px;
    }
  `
})
class TestComponent {
  tabButtonMaxWidth?: number;
  protected tabsObject: { heading: string; closable?: boolean }[] = [];

  set tabs(value: ({ heading: string; closable?: true } | string)[]) {
    this.tabsObject = value.map(tab => {
      if (typeof tab === 'string') {
        return { heading: tab };
      }
      {
        return tab;
      }
    });
  }

  readonly tabSet = viewChild.required(SiTabsetComponent);

  closeTriggered(tab: { heading: string; hidde?: boolean }): void {
    this.tabsObject = this.tabsObject.filter(t => t !== tab);
  }
}

describe('SiTabset', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: SiTabsetComponent;
  let testComponent: TestComponent;

  const getLength = (): number =>
    fixture.debugElement.queryAll(By.css(`.tab-container-buttonbar-list > button`)).length;
  const getHeading = (index: number): string =>
    fixture.debugElement.query(
      By.css(`.tab-container-buttonbar-list > button:nth-child(${index + 1}) .text-truncate`)
    ).nativeElement.innerText;
  const getActive = (index: number): boolean =>
    !!fixture.debugElement.query(
      By.css(`.tab-container-buttonbar-list > button:nth-child(${index + 1}).active`)
    );

  const getElement = (index: number): DebugElement =>
    fixture.debugElement.query(
      By.css(`.tab-container-buttonbar-list > button:nth-child(${index + 1}`)
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiTabsModule, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    testComponent = fixture.componentInstance;
    component = testComponent.tabSet();
  }));

  it('should be possible to create a tabComponent instance', async () => {
    expect(getLength()).toEqual(0);

    testComponent.tabs = ['test'];
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getLength()).toEqual(1);
    expect(getHeading(0)).toBe('test');
    expect(getActive(0)).toBe(true);
  });

  it('should be possible to add a few tabs to the tabComponent', async () => {
    testComponent.tabs = ['1', '2', '3'];

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getActive(0)).toBeTrue();
    expect(getActive(1)).toBeFalse();
    expect(getActive(2)).toBeFalse();
    expect(getLength()).toEqual(3);
  });

  it('should be possible to select a tab', () => {
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();

    getElement(1).nativeElement.click();

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

  it('should ignore tab selection with wrong input', fakeAsync(() => {
    testComponent.tabs = ['1', '2', '3'];

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(getActive(0)).toEqual(true);
    expect(component.selectedTabIndex).toEqual(0);
    component.selectedTabIndex = 2;
    expect(component.selectedTabIndex).toEqual(2);
    component.selectedTabIndex = -2;
    expect(component.selectedTabIndex).toEqual(2);
    component.selectedTabIndex = 5;
    expect(component.selectedTabIndex).toEqual(2);
  }));

  it('should should emit selectedTabIndexChange event', fakeAsync(() => {
    spyOn(component.selectedTabIndexChange, 'emit');
    testComponent.tabs = ['1', '2', '3'];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.selectedTabIndex = 2;
    expect(component.selectedTabIndexChange.emit).toHaveBeenCalledTimes(2); // the first call is caused by adding the tabs
  }));

  it('should scroll', () => {
    testComponent.tabs = ['Tab 1 name extender', 'Tab 1 name extender', 'Tab 1 name extender'];
    fixture.detectChanges();
    const preventDefault = jasmine.createSpy('preventDefault');

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
    await fixture.whenStable();
    if (document.hasFocus()) {
      getElement(0).nativeElement.focus();
      fixture.detectChanges();
      expect(getElement(0).attributes.tabindex).toEqual('-1');
      focusNext();
      expect(document.activeElement).toBe(getElement(1).nativeElement);
      focusPrevious();
      expect(document.activeElement).toBe(getElement(0).nativeElement);
    }
  });

  it('should restore focus to active element when blurred', async () => {
    testComponent.tabs = ['1', '2'];
    fixture.detectChanges();
    await fixture.whenStable();
    if (document.hasFocus()) {
      getElement(0).nativeElement.focus();
      focusNext();
      expect(document.activeElement).toBe(getElement(1).nativeElement);
      (document.activeElement! as HTMLElement).blur();
      fixture.detectChanges();
      expect(getElement(0).attributes.tabindex).toBe('0');
    }
  });

  it('should use defined tabButtonMaxWidth value', async () => {
    testComponent.tabButtonMaxWidth = 110;
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();
    await fixture.whenStable();

    const d1 = getElement(0).nativeElement.getBoundingClientRect();
    expect(d1.width).toBe(110);
    const d2 = getElement(1).nativeElement.getBoundingClientRect();
    expect(d2.width).toBe(110);
  });

  it('should use nav-tabs min-inline-size', async () => {
    testComponent.tabButtonMaxWidth = 90;
    testComponent.tabs = ['Tab 1 Long Long Long Long Long', 'Tab 2 Long Long Long Long Long'];
    fixture.detectChanges();
    await fixture.whenStable();

    const d1 = getElement(0).nativeElement.getBoundingClientRect();
    expect(d1.width).toBe(100);
    const d2 = getElement(1).nativeElement.getBoundingClientRect();
    expect(d2.width).toBe(100);
  });

  it('should emit tab close event for closable tab and preserve active tab', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    const closeSpy = spyOn(testComponent, 'closeTriggered').and.callThrough();
    getElement(3).nativeElement.click();
    getElement(2).query(By.css('.element-cancel')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(closeSpy).toHaveBeenCalledWith(jasmine.objectContaining({ heading: '3' }));
    expect(getElement(2).nativeElement).toBe(document.activeElement);
    focusPrevious();
    expect(getElement(1).nativeElement).toBe(document.activeElement);
  });

  it('should emit tab close event for closable tab and select next tab as active', async () => {
    testComponent.tabs = ['1', '2', { heading: '3', closable: true }, '4'];
    fixture.detectChanges();
    const closeSpy = spyOn(testComponent, 'closeTriggered').and.callThrough();
    getElement(2).nativeElement.click();
    getElement(2).query(By.css('.element-cancel')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(closeSpy).toHaveBeenCalledWith(jasmine.objectContaining({ heading: '3' }));
    expect(getElement(2).nativeElement).toBe(document.activeElement);
    focusPrevious();
    expect(getElement(1).nativeElement).toBe(document.activeElement);
  });

  it('should not display close icon for non closable tab', () => {
    testComponent.tabs = ['1', { heading: '2', closable: true }];
    fixture.detectChanges();
    let closeIcon = getElement(0).nativeElement.querySelector('.element-cancel');
    fixture.detectChanges();
    expect(closeIcon).toBeFalsy();
    closeIcon = getElement(1).nativeElement.querySelector('.element-cancel');
    fixture.detectChanges();
    expect(closeIcon).toBeTruthy();
  });
});
