/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ResizeObserverService } from '@spike-rabbit/element-ng/resize-observer';

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
  const readVisibilityStates = (): string[] =>
    Array.from(hostElement.querySelectorAll<HTMLElement>('[siAutoCollapsableListItem]')).map(
      element => element.style.visibility
    );

  const detectSizeChange = (): void => {
    fixture.detectChanges();
    tick();
    TestBed.inject(ResizeObserverService)._checkAll();
    fixture.detectChanges();
  };

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

  it('should collapse and expand items on container size changes', fakeAsync(() => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      detectSizeChange();
      component.width = 300;
      detectSizeChange();
      expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
      expect(
        hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
      ).toBe('Overflown Items: 3');
      component.width = 600;
      detectSizeChange();
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

  it('should respect additional content', fakeAsync(() => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      detectSizeChange();
      component.width = 300;
      component.showAdditionalContent = true;
      detectSizeChange();
      expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
    }
  }));

  it('should react to item changes', fakeAsync(() => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      detectSizeChange();
      component.moreItems.push(100, 100);
      component.width = 700;
      detectSizeChange();
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
      detectSizeChange();
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

  it('should react to disabled changes', fakeAsync(() => {
    component.width = 300;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.disabled = true;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.disabled = false;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  }));

  it('should react to list reset', fakeAsync(() => {
    component.width = 300;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('Overflown Items: 3');

    component.renderItems = false;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual([]);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('');
  }));

  it('should show new items if disabled', fakeAsync(() => {
    component.disabled = true;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.moreItems = [800];
    detectSizeChange();
    expect(readVisibilityStates()).toEqual([
      'visible',
      'visible',
      'visible',
      'visible',
      'visible',
      'visible'
    ]);
  }));

  it('should hide forced hide item', fakeAsync(() => {
    component.forceHideSecondItem = true;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'visible', 'visible', 'visible']);
    component.width = 300;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  }));

  it('should use host width', fakeAsync(() => {
    component.width = 300;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.useContainerElement = true;
    detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
  }));
});
