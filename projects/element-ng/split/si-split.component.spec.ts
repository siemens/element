/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, Injectable, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideSiUiState, SI_UI_STATE_SERVICE, UIStateStorage } from '@siemens/element-ng/common';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import {
  CollapseTo,
  PartState,
  Scale,
  SiSplitModule,
  SplitOrientation,
  SplitSize,
  SplitUnit
} from './index';
import { SiSplitPartComponent } from './si-split-part.component';
import { SiSplitComponent as TestComponent } from './si-split.component';

@Injectable()
class SynchronousMockStore implements UIStateStorage {
  store: Record<string, string> = {};
  save(key: string, data: string): void {
    this.store[key] = data;
  }

  load(key: string): string | undefined | null {
    return this.store[key];
  }
}

@Component({
  imports: [SiSplitModule],
  template: `
    <div
      style="position: relative;"
      [style.width.px]="containerWidth()"
      [style.height.px]="containerHeight()"
    >
      <si-split
        style="width: 100%; height: 100%;"
        stateId="split-test"
        [orientation]="orientation()"
        [gutterSize]="gutterSize()"
      >
        <si-split-part
          #splitPart1
          stateId="one"
          collapseDirection="start"
          collapseIconClass="element-command-arrow"
          collapseLabel="collapse"
          heading="part 1"
          removeContentOnCollapse="false"
          showCollapseButton="true"
          showHeader="true"
          [actions]="[]"
          [collapseToMinSize]="collapseToMinSize1()"
          [minSize]="minSize1()"
          [scale]="scale1()"
          [size]="size1()"
          (collapseChanged)="collapseChanged1($event)"
          (stateChange)="stateChange1($event)"
        >
          Test 1
        </si-split-part>
        <si-split-part
          #splitPart2
          stateId="two"
          collapseIconClass="element-command-arrow"
          collapseLabel="collapse"
          heading="part 2"
          removeContentOnCollapse="false"
          showCollapseButton="true"
          showHeader="true"
          [actions]="[]"
          [collapseDirection]="collapseDirection2()"
          [collapseToMinSize]="false"
          [minSize]="0"
          [scale]="scale2()"
          [size]="size2()"
          [collapseOthers]="collapseOthers2()"
          (collapseChanged)="collapseChanged2($event)"
          (stateChange)="stateChange2($event)"
        >
          Test 2
        </si-split-part>
        @if (showPart3()) {
          <si-split-part
            #splitPart3
            collapseLabel="collapse"
            collapseIconClass="element-command-arrow"
            heading="part 3"
            removeContentOnCollapse="false"
            stateId="three"
            showCollapseButton="true"
            showHeader="true"
            [actions]="[]"
            [collapseDirection]="collapseDirection3()"
            [collapseToMinSize]="false"
            [minSize]="minSize3()"
            [scale]="scale3()"
            [size]="size3()"
            (collapseChanged)="collapseChanged3($event)"
            (stateChange)="stateChange3($event)"
          >
            Test 3
          </si-split-part>
        }
      </si-split>
    </div>
  `
})
class WrapperComponent {
  readonly split = viewChild.required(TestComponent);
  readonly splitPart = viewChild.required<SiSplitPartComponent>('splitPart1');
  readonly containerWidth = signal(532);
  readonly containerHeight = signal(532);
  readonly splitElement = viewChild.required(TestComponent, { read: ElementRef });
  readonly orientation = signal<SplitOrientation>('horizontal');
  readonly gutterSize = signal(16);
  readonly splitPart1 = viewChild.required('splitPart1', { read: ElementRef });
  readonly collapseToMinSize1 = signal(false);
  readonly minSize1 = signal(0);
  readonly scale1 = signal<Scale>('auto');
  readonly size1 = signal<SplitSize>(0);
  readonly splitPart2 = viewChild.required('splitPart2', { read: ElementRef });
  readonly collapseDirection2 = signal<CollapseTo>('start');
  readonly scale2 = signal<Scale>('auto');
  readonly size2 = signal<SplitSize>(0);
  readonly splitPart3 = viewChild.required('splitPart3', { read: ElementRef });
  readonly collapseDirection3 = signal<CollapseTo>('start');
  readonly minSize3 = signal(0);
  readonly scale3 = signal<Scale>('auto');
  readonly size3 = signal<SplitSize>(0);
  readonly showPart3 = signal(true);
  readonly collapseOthers2 = signal(true);
  collapseChanged1 = (event: boolean): void => {};
  stateChange1 = (event: PartState): void => {};
  collapseChanged2 = (event: boolean): void => {};
  stateChange2 = (event: PartState): void => {};
  collapseChanged3 = (event: boolean): void => {};
  stateChange3 = (event: PartState): void => {};

  measureSize1(): number {
    return this.measureSize(this.splitPart1());
  }

  measureSize2(): number {
    return this.measureSize(this.splitPart2());
  }

  measureSize3(): number {
    return this.measureSize(this.splitPart3());
  }

  setSizes(sizes: [number, number, number], unit: SplitUnit = 'fr'): void {
    this.size1.set(unit === 'fr' ? `${sizes[0]}fr` : sizes[0]);
    this.size2.set(unit === 'fr' ? `${sizes[1]}fr` : sizes[1]);
    this.size3.set(unit === 'fr' ? `${sizes[2]}fr` : sizes[2]);
  }

  private measureSize(element: ElementRef<HTMLElement>): number {
    if (this.orientation() === 'horizontal') {
      return element.nativeElement.getBoundingClientRect().width;
    } else {
      return element.nativeElement.getBoundingClientRect().height;
    }
  }
}

describe('SiSplitComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let component: ElementRef;
  let element: HTMLElement;
  let partComponent1: ElementRef;
  let partElement1: HTMLElement;
  let partComponent2: ElementRef;
  let partElement2: HTMLElement;
  let partComponent3: ElementRef;
  let partElement3: HTMLElement;
  let getSplitGuttersElements: (index: number) => HTMLElement;

  const drag = (
    dispatchElement: HTMLElement,
    targetElement: HTMLElement,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
    touch = false,
    incorrect = false,
    duration = 3000,
    durationBetweenSteps = 100
  ): void => {
    dispatchElement.dispatchEvent(
      incorrect
        ? new Event('mousedown')
        : touch
          ? new TouchEvent('touchstart', {
              bubbles: true,
              touches: [
                new Touch({
                  identifier: Date.now() + 1,
                  radiusX: 10,
                  radiusY: 10,
                  rotationAngle: 0,
                  target: targetElement,
                  clientX: xStart,
                  clientY: yStart,
                  pageX: xStart,
                  pageY: yStart,
                  force: 1
                })
              ]
            })
          : new MouseEvent('mousedown', {
              bubbles: true,
              clientX: xStart,
              clientY: yStart,
              relatedTarget: targetElement
            })
    );
    fixture.detectChanges();

    const steps = duration / durationBetweenSteps;
    const xDiff = xEnd - xStart;
    const xStep = xDiff / steps;
    const yDiff = yEnd - yStart;
    const yStep = yDiff / steps;
    let currentX = xStart;
    let currentY = yStart;
    for (let i = 0; i < steps; i++) {
      currentX += xStep;
      currentY += yStep;
      dispatchElement.dispatchEvent(
        incorrect
          ? new Event('mousemove')
          : touch
            ? new TouchEvent('touchmove', {
                bubbles: true,
                touches: [
                  new Touch({
                    identifier: Date.now() + 1,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    target: targetElement,
                    clientX: currentX,
                    clientY: currentY,
                    pageX: currentX,
                    pageY: currentY,
                    force: 1
                  })
                ]
              })
            : new MouseEvent('mousemove', {
                bubbles: true,
                clientX: currentX,
                clientY: currentY,
                movementX: xStep,
                movementY: yStep,
                relatedTarget: targetElement
              })
      );
    }

    dispatchElement.dispatchEvent(
      incorrect
        ? new Event('mouseup')
        : touch
          ? new TouchEvent('touchend', {
              bubbles: true,
              touches: [
                new Touch({
                  identifier: Date.now() + 1,
                  radiusX: 10,
                  radiusY: 10,
                  rotationAngle: 0,
                  target: targetElement,
                  clientX: xEnd,
                  clientY: yEnd,
                  pageX: xEnd,
                  pageY: yEnd,
                  force: 1
                })
              ]
            })
          : new MouseEvent('mouseup', {
              bubbles: true,
              clientX: xEnd,
              clientY: yEnd,
              relatedTarget: targetElement
            })
    );
    fixture.detectChanges();
  };

  const dragFromElementToElement = (
    firstElement: HTMLElement,
    firstElementXPercentage: number,
    firstElementYPercentage: number,
    secondElement: HTMLElement,
    secondElementXPercentage: number,
    secondElementYPercentage: number,
    touch = false,
    incorrect = false,
    duration = 3000,
    durationBetweenSteps = 100
  ): void => {
    const firstSize = firstElement.getBoundingClientRect();
    const secondSize = secondElement.getBoundingClientRect();
    drag(
      firstElement,
      secondElement,
      firstSize.left + (firstSize.width * firstElementXPercentage) / 100,
      firstSize.top + (firstSize.height * firstElementYPercentage) / 100,
      secondSize.left + (secondSize.width * secondElementXPercentage) / 100,
      secondSize.top + (secondSize.height * secondElementYPercentage) / 100,
      touch,
      incorrect,
      duration,
      durationBetweenSteps
    );
  };

  const setup = (useStateService = false): void => {
    const providers = useStateService ? [provideSiUiState({ store: SynchronousMockStore })] : [];
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SiSplitModule, WrapperComponent],
        providers
      }).compileComponents();
    });
  };

  describe('using ui state service', () => {
    describe('without SiUIStateService', () => {
      setup();

      beforeEach(async () => {
        fixture = TestBed.createComponent(WrapperComponent);
        wrapperComponent = fixture.componentInstance;
        element = fixture.nativeElement;
        wrapperComponent.setSizes([20, 60, 20], 'fr');
        await fixture.whenStable();
      });

      it('should create and set inputs', () => {
        expect(wrapperComponent).toBeTruthy();
        const split = element.querySelector('si-split')!.innerHTML;

        expect(split).toContain('Test 1');
        expect(split).toContain('Test 2');
        expect(split).toContain('Test 3');

        expect(wrapperComponent.size1()).toEqual('20fr');
        expect(wrapperComponent.size2()).toEqual('60fr');
        expect(wrapperComponent.size3()).toEqual('20fr');
        expect(wrapperComponent.split().orientation()).toEqual('horizontal');
      });
    });

    describe('with SiUIStateService', () => {
      setup(true);

      describe('but no persisted state', () => {
        beforeEach(async () => {
          fixture = TestBed.createComponent(WrapperComponent);
          wrapperComponent = fixture.componentInstance;
          element = fixture.nativeElement;
          wrapperComponent.setSizes([20, 60, 20], 'fr');
          await fixture.whenStable();
        });

        it('should create with ui state service', () => {
          expect(wrapperComponent).toBeTruthy();
          const split = element.querySelector('si-split')!.innerHTML;

          expect(split).toContain('Test 1');
          expect(split).toContain('Test 2');
          expect(split).toContain('Test 3');

          expect(wrapperComponent.size1()).toEqual('20fr');
          expect(wrapperComponent.size2()).toEqual('60fr');
          expect(wrapperComponent.size3()).toEqual('20fr');
          expect(wrapperComponent.split().orientation()).toEqual('horizontal');
        });

        it('should save ui state', async () => {
          // cannot use jasmine.clock here
          await new Promise(resolve => setTimeout(resolve));
          wrapperComponent.splitPart().toggleCollapse();
          const uiStateMock =
            await TestBed.inject(SI_UI_STATE_SERVICE).load<Record<string, any>>('split-test');

          expect(uiStateMock).toBeDefined();
          expect(uiStateMock!.one.expanded).toBe(false);
          expect(uiStateMock!.two.expanded).toBe(true);
          expect(uiStateMock!.three.expanded).toBe(true);
        });
      });

      describe('with SiUIStateService and persisted state', () => {
        beforeEach(() => {
          const store = TestBed.inject(SI_UI_STATE_SERVICE);
          store.save('split-test', {
            one: { initialSize: 20, initialUnit: 'fr', size: 40, expanded: true },
            two: { initialSize: 60, initialUnit: 'fr', size: 40, expanded: true },
            three: { initialSize: 20, initialUnit: 'fr', size: 20, expanded: true }
          });

          fixture = TestBed.createComponent(WrapperComponent);
          wrapperComponent = fixture.componentInstance;
          wrapperComponent.setSizes([20, 60, 20], 'fr');
          // We need this here to run checks after async tasks completed.
          fixture.autoDetectChanges();
          element = fixture.nativeElement;
        });

        it('should load and configure split parts', async () => {
          // cannot use jasmine.clock here
          await new Promise(resolve => setTimeout(resolve));
          await fixture.whenStable();
          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);
          expect(wrapperComponent.split().orientation()).toEqual('horizontal');
        });
      });
    });
  });

  describe('independent of ui state service', () => {
    setup();
    beforeEach(async () => {
      fixture = TestBed.createComponent(WrapperComponent);
      wrapperComponent = fixture.componentInstance;
      await fixture.whenStable();
      component = wrapperComponent.splitElement();
      element = component.nativeElement;
      partComponent1 = wrapperComponent.splitPart1();
      partElement1 = partComponent1.nativeElement;
      partComponent2 = wrapperComponent.splitPart2();
      partElement2 = partComponent2.nativeElement;
      partComponent3 = wrapperComponent.splitPart3();
      partElement3 = partComponent3.nativeElement;
      getSplitGuttersElements = index =>
        element.querySelectorAll<HTMLElement>('.si-split-gutter').item(index)!;
    });

    describe('in horizontal orientation', () => {
      it('should display with set sizes and gutter size', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should accept sizes with units', async () => {
        wrapperComponent.size1.set('200px');
        wrapperComponent.size2.set('1fr');
        wrapperComponent.size3.set('1fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should preserve fractional sizes when a part is removed and re-added', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));

        wrapperComponent.showPart3.set(false);
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));

        wrapperComponent.showPart3.set(true);
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size while respecting min size after resize', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.minSize3.set(175);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(186, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(139, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(175, 0);

        wrapperComponent.containerWidth.set(1064);
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(400, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(300, 0);
      });

      it('should keep px sizes after resize', async () => {
        wrapperComponent.setSizes([200, 150, 150], 'px');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.containerWidth.set(1064);
        await fixture.whenStable();
        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should use px for configured px sizes and fr for configured fr sizes', async () => {
        wrapperComponent.size1.set(200);
        wrapperComponent.size2.set('1fr');
        wrapperComponent.size3.set('3fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(664);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(300, 0);
      });

      it('should collapse part on click if enabled', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement1.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(246, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(246, 0);
      });

      it('should collapse part to min size on click if set', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.collapseToMinSize1.set(true);
        wrapperComponent.minSize1.set(50);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement1.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(50, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(241, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(241, 0);
      });

      it('should switch to vertical orientation', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.containerHeight.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.orientation.set('vertical');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size and resize on drag', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement2, 50, 50);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, -0.4);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(58, -0.4);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(242, -0.4);
      });

      it('should display with set sizes and gutter size and not resize on incorrect drag', async () => {
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(
          getSplitGuttersElements(1),
          50,
          50,
          partElement2,
          50,
          50,
          false,
          true
        );

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size and resize to min size on drag', async () => {
        wrapperComponent.setSizes([200, 150, 150], 'px');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.minSize3.set(100);
        wrapperComponent.scale1.set('none');
        wrapperComponent.scale2.set('auto');
        wrapperComponent.scale3.set('none');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement3, 50, 50);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);
      });

      if ('TouchEvent' in window) {
        it('should display with set sizes and gutter size and resize on touch drag', async () => {
          wrapperComponent.setSizes([40, 30, 30], 'fr');
          wrapperComponent.containerWidth.set(564);
          wrapperComponent.gutterSize.set(32);
          await fixture.whenStable();

          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

          dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement2, 50, 50, true);

          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(59, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(241, 0);
        });
      }

      it('should display with set sizes and gutter size after changes', async () => {
        wrapperComponent.setSizes([20, 60, 20], 'fr');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);

        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should collapse all to the same side on click', async () => {
        wrapperComponent.orientation.set('horizontal');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.collapseDirection2.set('end');
        wrapperComponent.collapseDirection3.set('end');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(484, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(40, 0);
      });

      it('should only collapse split part if collapseOthers2 is false', async () => {
        wrapperComponent.orientation.set('horizontal');
        wrapperComponent.setSizes([40, 20, 40], 'fr');
        wrapperComponent.gutterSize.set(32);
        wrapperComponent.containerWidth.set(564);
        wrapperComponent.collapseDirection2.set('end');
        wrapperComponent.collapseDirection3.set('end');
        wrapperComponent.collapseOthers2.set(false);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(200, 0);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(246, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(246, 0);
      });
    });

    describe('in vertical orientation', () => {
      it('should display with set sizes and gutter size', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should switch to horizontal orientation', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.orientation.set('horizontal');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size and resize on drag', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement2, 50, 50);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(67, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(233, 0);
      });

      if ('TouchEvent' in window) {
        it('should display with set sizes and gutter size and resize on touch drag', async () => {
          wrapperComponent.orientation.set('vertical');
          wrapperComponent.setSizes([40, 30, 30], 'fr');
          await fixture.whenStable();

          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

          dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement2, 50, 50, true);

          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(67, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(233, 0);
        });
      }

      it('should display with set sizes and gutter size and resize to min size on drag', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([200, 150, 150], 'px');
        wrapperComponent.minSize1.set(100);
        wrapperComponent.scale1.set('none');
        wrapperComponent.scale2.set('auto');
        wrapperComponent.scale3.set('none');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(0), 50, 50, partElement1, 50, 50);
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(250, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size after changes with scale none', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([100, 300, 100], 'px');
        wrapperComponent.scale1.set('none');
        wrapperComponent.scale2.set('none');
        wrapperComponent.scale3.set('none');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);

        wrapperComponent.setSizes([200, 150, 150], 'px');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should collapse all to the same side on click', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(452, 0);
      });

      it('should switch to horizontal orientation after collapsed part on click', async () => {
        wrapperComponent.orientation.set('vertical');
        wrapperComponent.setSizes([40, 30, 30], 'fr');
        wrapperComponent.collapseDirection3.set('end');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement3.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(272, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(204, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(40, 0);

        wrapperComponent.orientation.set('horizontal');
        await fixture.whenStable();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(272, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(204, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(40, 0);
      });
    });
  });
});
