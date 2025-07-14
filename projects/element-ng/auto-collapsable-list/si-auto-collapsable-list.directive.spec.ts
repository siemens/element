/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListModule } from './si-auto-collapsable-list.module';

@Component({
  imports: [SiAutoCollapsableListModule],
  template: `
    <div #containerElement [style.width.px]="containerWidth">
      <div
        class="d-flex flex-align-start"
        [style.width.px]="width"
        [siAutoCollapsableList]="!disabled"
        [siAutoCollapsableListContainerElement]="useContainerElement ? containerElement : undefined"
      >
        @if (renderItems) {
          <div siAutoCollapsableListItem></div>
          <div siAutoCollapsableListItem [forceHide]="forceHideSecondItem"></div>
          <div siAutoCollapsableListItem></div>
          @if (showAdditionalContent) {
            <div siAutoCollapsableListAdditionalContent></div>
          }
          <div siAutoCollapsableListItem></div>
          <div siAutoCollapsableListItem></div>
          @for (moreItem of moreItems; track $index) {
            <div siAutoCollapsableListItem [style.inline-size.px]="moreItem"> </div>
          }
        }
        <div #overflowItem="siAutoCollapsableListOverflowItem" siAutoCollapsableListOverflowItem>
          Overflown Items: {{ overflowItem.hiddenItemCount }}
        </div>
      </div>
    </div>
  `,
  styles: `
    [siAutoCollapsableListItem],
    [siAutoCollapsableListAdditionalContent],
    [siAutoCollapsableListOverflowItem] {
      inline-size: 100px;
      flex: 0 0 100px;
      block-size: 1px;
    }
  `
})
class TestComponent {
  width = 600;
  containerWidth = 700;

  moreItems: number[] = [];

  renderItems = true;

  showAdditionalContent = false;

  disabled = false;

  forceHideSecondItem = false;

  useContainerElement = false;

  readonly items = viewChildren(SiAutoCollapsableListItemDirective);
}

describe('SiAutoCollapsableListDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let hostElement: HTMLElement;
  // A timeout that works with `await`. We have to use `waitForAsync()``
  // in the tests below because `tick()` doesn't work because `ResizeObserver`
  // operates outside of the zone
  const timeout = async (ms?: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));
  const readVisibilityStates = (): string[] =>
    Array.from(hostElement.querySelectorAll<HTMLElement>('[siAutoCollapsableListItem]')).map(
      element => element.style.visibility
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiAutoCollapsableListModule, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    hostElement = fixture.nativeElement;
  });

  it('should not flicker on initial render', fakeAsync(() => {
    fixture.detectChanges();
    hostElement
      .querySelectorAll<HTMLElement>('[siAutoCollapsableListItem]')
      .forEach(element => expect(element.style.visibility).toBe('hidden'));
    tick();
    fixture.detectChanges();
    hostElement
      .querySelectorAll<HTMLElement>('[siAutoCollapsableListItem]')
      .forEach(element => expect(element.style.visibility).toBe('visible'));
    component.items().forEach(item => expect(item.canBeVisible()).toBe(true));
  }));

  it('should collapse and expand items on container size changes', waitForAsync(async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await timeout(0);
      fixture.detectChanges();
      component.width = 300;
      fixture.detectChanges();
      await timeout(200);
      fixture.detectChanges();
      expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
      expect(
        hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
      ).toBe('Overflown Items: 3');
      component.width = 600;
      fixture.detectChanges();
      await timeout(1000); // Don't know why, but ResizeObserver firing is very unreliable --> wait very long for it
      fixture.detectChanges();
      expect(readVisibilityStates()).toEqual([
        'visible',
        'visible',
        'visible',
        'visible',
        'visible'
      ]);
      expect(
        hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.style
          .visibility
      ).toBe('hidden');
    }
  }));

  it('should respect additional content', waitForAsync(async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await timeout();
      fixture.detectChanges();
      component.width = 300;
      component.showAdditionalContent = true;
      fixture.detectChanges();
      await timeout(200);
      fixture.detectChanges();
      expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
    }
  }));

  it('should react to item changes', waitForAsync(async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await timeout();
      fixture.detectChanges();
      component.moreItems.push(100, 100);
      component.width = 700;
      fixture.detectChanges();
      await timeout(200);
      fixture.detectChanges();
      expect(readVisibilityStates()).toEqual([
        'visible',
        'visible',
        'visible',
        'visible',
        'visible',
        'visible',
        'visible'
      ]);
      component.moreItems[0] = 0;
      fixture.detectChanges();
      await timeout(200);
      fixture.detectChanges();
      expect(readVisibilityStates()).toEqual([
        'visible',
        'visible',
        'visible',
        'visible',
        'visible',
        'visible',
        'visible'
      ]);
    }
  }));

  it('should react to disabled changes', waitForAsync(async () => {
    component.width = 300;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.disabled = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.disabled = false;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  }));

  it('should react to list reset', waitForAsync(async () => {
    component.width = 300;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('Overflown Items: 3');

    component.renderItems = false;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual([]);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('');
  }));

  it('should show new items if disabled', waitForAsync(async () => {
    component.disabled = true;
    fixture.detectChanges();
    await timeout(0);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.moreItems = [800];
    fixture.detectChanges();
    await timeout(0);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual([
      'visible',
      'visible',
      'visible',
      'visible',
      'visible',
      'visible'
    ]);
  }));

  it('should hide forced hide item', waitForAsync(async () => {
    component.forceHideSecondItem = true;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'visible', 'visible', 'visible']);
    component.width = 300;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  }));

  it('should use host width', waitForAsync(async () => {
    component.width = 300;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.useContainerElement = true;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
  }));
});
