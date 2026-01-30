/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../resize-observer/mock-resize-observer.spec';
import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListModule } from './si-auto-collapsable-list.module';

@Component({
  imports: [SiAutoCollapsableListModule],
  template: `
    <div #containerElement [style.width.px]="containerWidth()" [style.height.px]="50">
      <div
        class="d-flex flex-align-start"
        [style.width.px]="width()"
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
  readonly width = signal(600);
  readonly containerWidth = signal(700);

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

  const detectSizeChange = async (opts?: {
    width?: number;
    containerWidth?: number;
  }): Promise<void> => {
    if (opts?.width !== undefined) {
      component.width.set(opts.width);
    }
    if (opts?.containerWidth !== undefined) {
      component.containerWidth.set(opts.containerWidth);
    }
    await tick();
    fixture.detectChanges();

    MockResizeObserver.triggerResize({});

    await tick();
  };

  const tick = async (ms = 100): Promise<void> => {
    jasmine.clock().tick(ms);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    mockResizeObserver();
    await TestBed.configureTestingModule({
      imports: [SiAutoCollapsableListModule, TestComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    hostElement = fixture.nativeElement;
  });

  beforeEach(() => jasmine.clock().install());

  afterEach(() => {
    restoreResizeObserver();
    jasmine.clock().uninstall();
  });

  it('should collapse and expand items on container size changes', async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await detectSizeChange({ width: 300 });
      expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
      expect(
        hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
      ).toBe('Overflown Items: 3');
      await detectSizeChange({ width: 600 });
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
  });

  it('should respect additional content', async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await detectSizeChange();
      component.showAdditionalContent = true;
      await detectSizeChange({ width: 300 });
      expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
    }
  });

  it('should react to item changes', async () => {
    fixture.detectChanges();
    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      await detectSizeChange();
      component.moreItems.push(100, 100);
      await detectSizeChange({ width: 700 });
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
      fixture.changeDetectorRef.markForCheck();
      await detectSizeChange();
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
  });

  it('should react to disabled changes', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.disabled = false;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to list reset', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('Overflown Items: 3');

    component.renderItems = false;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual([]);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!.innerText
    ).toBe('');
  });

  it('should show new items if disabled', async () => {
    component.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.moreItems = [800];
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual([
      'visible',
      'visible',
      'visible',
      'visible',
      'visible',
      'visible'
    ]);
  });

  it('should hide forced hide item', async () => {
    component.forceHideSecondItem = true;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'visible', 'visible', 'visible']);
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should use host width', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.useContainerElement = true;
    fixture.changeDetectorRef.markForCheck();
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
  });
});
