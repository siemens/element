/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiAutoCollapsableListItemDirective } from './si-auto-collapsable-list-item.directive';
import { SiAutoCollapsableListModule } from './si-auto-collapsable-list.module';

@Component({
  imports: [SiAutoCollapsableListModule],
  template: `
    <div #containerElement [style.width.px]="containerWidth()" [style.height.px]="50">
      <div
        class="d-flex flex-align-start"
        [style.width.px]="width()"
        [style.column-gap.px]="cssGap()"
        [style.padding-inline.px]="padding()"
        [gap]="gap()"
        [siAutoCollapsableList]="!disabled()"
        [siAutoCollapsableListContainerElement]="
          useContainerElement() ? containerElement : undefined
        "
      >
        @if (renderItems()) {
          <div siAutoCollapsableListItem [style.inline-size.px]="firstItemWidth()"></div>
          <div siAutoCollapsableListItem [forceHide]="forceHideSecondItem()"></div>
          <div siAutoCollapsableListItem></div>
          @if (showAdditionalContent()) {
            <div siAutoCollapsableListAdditionalContent></div>
          }
          <div siAutoCollapsableListItem></div>
          <div siAutoCollapsableListItem></div>
          @for (moreItem of moreItems(); track $index) {
            <div siAutoCollapsableListItem [style.inline-size.px]="moreItem"> </div>
          }
        }
        @if (renderOverflow()) {
          <div
            #overflowItem="siAutoCollapsableListOverflowItem"
            siAutoCollapsableListOverflowItem
            [style.inline-size.px]="overflowWidth()"
          >
            Overflown Items: {{ overflowItem.hiddenItemCount() }}
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    [siAutoCollapsableListItem],
    [siAutoCollapsableListAdditionalContent],
    [siAutoCollapsableListOverflowItem] {
      inline-size: 100px;
      flex: 0 0 auto;
      block-size: 20px;
      border: 1px solid black;
    }
  `
})
class TestComponent {
  readonly width = signal(600);
  readonly containerWidth = signal(700);
  readonly moreItems = signal<number[]>([]);
  readonly renderItems = signal(true);
  readonly showAdditionalContent = signal(false);
  readonly disabled = signal(false);
  readonly forceHideSecondItem = signal(false);
  readonly useContainerElement = signal(false);
  readonly renderOverflow = signal(true);
  readonly overflowWidth = signal(100);
  readonly firstItemWidth = signal(100);
  readonly cssGap = signal(0);
  readonly gap = signal<number | undefined>(undefined);
  readonly padding = signal(0);
  readonly items = viewChildren(SiAutoCollapsableListItemDirective);
}

describe('SiAutoCollapsableListDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let hostElement: HTMLElement;
  const readVisibilityStates = (): string[] =>
    Array.from(hostElement.querySelectorAll<HTMLElement>('[siAutoCollapsableListItem]')).map(
      element => (element.classList.contains('visible') ? 'visible' : 'hidden')
    );

  // Each browser rendering frame runs in order:
  //   requestAnimationFrame (rAF) callbacks → Style → Layout → ResizeObserver
  // (see https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering)
  //
  // A single rAF resolves before the ResizeObserver step of its own frame,
  // so its promise would settle too early. The nested (second) rAF is
  // registered during the first rAF and therefore runs in the next frame —
  // after the current frame has already completed Layout and delivered
  // ResizeObserver notifications.
  const waitForResizeObserver = (): Promise<void> =>
    new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
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
    await waitForResizeObserver();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    hostElement = fixture.nativeElement;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => vi.useRealTimers());

  it('should determine visibility during the initial render', async () => {
    component.width.set(300);
    fixture.detectChanges();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  });

  it('should collapse and expand items on container size changes', async () => {
    fixture.detectChanges();
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!
    ).toHaveTextContent('Overflown Items: 3');
    await detectSizeChange({ width: 600 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!
    ).toHaveStyle({ visibility: 'hidden' });
  });

  it('should respect additional content', async () => {
    fixture.detectChanges();
    await detectSizeChange();
    component.showAdditionalContent.set(true);
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to item changes', async () => {
    fixture.detectChanges();
    await detectSizeChange();
    component.moreItems.update(items => [...items, 100, 100]);
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
    component.moreItems.update(items => [0, ...items.slice(1)]);
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
  });

  it('should react to disabled changes', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.disabled.set(true);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.disabled.set(false);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to list reset', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!
    ).toHaveTextContent('Overflown Items: 3');

    component.renderItems.set(false);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual([]);
    expect(
      hostElement.querySelector<HTMLElement>('[siAutoCollapsableListOverflowItem]')!
    ).not.toBeVisible();
  });

  it('should show new items if disabled', async () => {
    component.disabled.set(true);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.moreItems.set([800]);
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
    component.forceHideSecondItem.set(true);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'visible', 'visible', 'visible']);
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should use host width', async () => {
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
    component.useContainerElement.set(true);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    component.useContainerElement.set(false);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  });

  it('should reclaim space when additional content is removed', async () => {
    component.showAdditionalContent.set(true);
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);

    component.showAdditionalContent.set(false);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to an individual item resizing', async () => {
    await detectSizeChange({ width: 300 });

    component.firstItemWidth.set(200);
    await detectSizeChange();

    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to the overflow indicator resizing', async () => {
    await detectSizeChange({ width: 300 });

    component.overflowWidth.set(200);
    await detectSizeChange();

    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
    expect(hostElement.querySelector('[siAutoCollapsableListOverflowItem]')).toHaveTextContent(
      'Overflown Items: 4'
    );
  });

  it('should react to the overflow indicator being added and removed', async () => {
    component.renderOverflow.set(false);
    await detectSizeChange({ width: 300 });
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'hidden', 'hidden']);

    component.renderOverflow.set(true);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'hidden', 'hidden', 'hidden']);

    component.renderOverflow.set(false);
    await detectSizeChange();
    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'hidden', 'hidden']);
  });

  it('should not reserve overflow space when all items fit exactly', async () => {
    component.overflowWidth.set(200);
    await detectSizeChange({ width: 500 });

    expect(readVisibilityStates()).toEqual(['visible', 'visible', 'visible', 'visible', 'visible']);
    expect(hostElement.querySelector('[siAutoCollapsableListOverflowItem]')).not.toBeVisible();
  });

  it('should account for CSS gaps and additional content', async () => {
    component.cssGap.set(10);
    component.showAdditionalContent.set(true);
    await detectSizeChange({ width: 420 });

    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should react to an explicit gap changing without a resize', async () => {
    await detectSizeChange({ width: 300 });
    component.gap.set(10);
    await fixture.whenStable();

    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should subtract container padding', async () => {
    component.padding.set(10);
    await detectSizeChange({ width: 300 });

    expect(readVisibilityStates()).toEqual(['visible', 'hidden', 'hidden', 'hidden', 'hidden']);
  });

  it('should hide all items when the container has no space', async () => {
    await detectSizeChange({ width: 0 });

    expect(readVisibilityStates()).toEqual(['hidden', 'hidden', 'hidden', 'hidden', 'hidden']);
    expect(hostElement.querySelector('[siAutoCollapsableListOverflowItem]')).toHaveTextContent(
      'Overflown Items: 5'
    );
  });

  it('should release resize observers when destroyed', async () => {
    const unobserve = vi.spyOn(ResizeObserver.prototype, 'unobserve');
    fixture.detectChanges();
    await waitForResizeObserver();
    await fixture.whenStable();

    const listElement = hostElement.querySelector<HTMLElement>('.position-relative')!;
    fixture.destroy();

    expect(unobserve).toHaveBeenCalledWith(listElement);
    unobserve.mockRestore();
  });

  it('should release an item resize observer when the item is removed', async () => {
    component.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const unobserve = vi.spyOn(ResizeObserver.prototype, 'unobserve');
    const itemElement = hostElement.querySelector<HTMLElement>('[siAutoCollapsableListItem]')!;
    component.renderItems.set(false);
    await fixture.whenStable();

    expect(unobserve).toHaveBeenCalledWith(itemElement);
    unobserve.mockRestore();
  });
});
