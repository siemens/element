/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injectable,
  TemplateRef,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideSiUiState, SI_UI_STATE_SERVICE, UIStateStorage } from '@siemens/element-ng/common';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import { Action, CollapseTo, PartState, Scale, SiSplitModule, SplitOrientation } from './index';
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
      [style.width]="containerWidth + 'px'"
      [style.height]="containerHeight + 'px'"
    >
      <si-split
        style="width: 100%; height: 100%;"
        stateId="split-test"
        [orientation]="orientation"
        [sizes]="sizes"
        [gutterSize]="gutterSize"
      >
        <si-split-part
          #splitPart1
          stateId="one"
          [actions]="actions1"
          [collapseDirection]="collapseDirection1"
          [collapseIconClass]="collapseIconClass1"
          [collapseToMinSize]="collapseToMinSize1"
          [headerTemplate]="headerTemplate1"
          [heading]="heading1"
          [minSize]="minSize1"
          [removeContentOnCollapse]="removeContentOnCollapse1"
          [scale]="scale1"
          [showCollapseButton]="showCollapseButton1"
          [showHeader]="showHeader1"
          [collapseLabel]="collapseLabel1"
          (collapseChanged)="collapseChanged1($event)"
          (stateChange)="stateChange1($event)"
        >
          Test 1
        </si-split-part>
        <si-split-part
          #splitPart2
          stateId="two"
          [actions]="actions2"
          [collapseDirection]="collapseDirection2"
          [collapseIconClass]="collapseIconClass2"
          [collapseToMinSize]="collapseToMinSize2"
          [headerTemplate]="headerTemplate2"
          [heading]="heading2"
          [minSize]="minSize2"
          [removeContentOnCollapse]="removeContentOnCollapse2"
          [scale]="scale2"
          [showCollapseButton]="showCollapseButton2"
          [showHeader]="showHeader2"
          [collapseLabel]="collapseLabel2"
          [collapseOthers]="collapseOthers2"
          (collapseChanged)="collapseChanged2($event)"
          (stateChange)="stateChange2($event)"
        >
          Test 2
        </si-split-part>
        <si-split-part
          #splitPart3
          stateId="three"
          [actions]="actions3"
          [collapseDirection]="collapseDirection3"
          [collapseIconClass]="collapseIconClass3"
          [collapseToMinSize]="collapseToMinSize3"
          [headerTemplate]="headerTemplate3"
          [heading]="heading3"
          [minSize]="minSize3"
          [removeContentOnCollapse]="removeContentOnCollapse3"
          [scale]="scale3"
          [showCollapseButton]="showCollapseButton3"
          [showHeader]="showHeader3"
          [collapseLabel]="collapseLabel3"
          (collapseChanged)="collapseChanged3($event)"
          (stateChange)="stateChange3($event)"
        >
          Test 3
        </si-split-part>
      </si-split>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly split = viewChild.required(TestComponent);
  readonly splitPart = viewChild.required<SiSplitPartComponent>('splitPart1');
  containerWidth = 532;
  containerHeight = 532;
  readonly splitElement = viewChild.required(TestComponent, { read: ElementRef });
  orientation: SplitOrientation = 'horizontal';
  sizes: number[] = [];
  gutterSize = 16;
  readonly splitPart1 = viewChild.required('splitPart1', { read: ElementRef });
  actions1: Action[] = [];
  collapseDirection1: CollapseTo = 'start';
  collapseIconClass1 = 'element-command-arrow';
  collapseToMinSize1 = false;
  headerStatusColor1?: string;
  headerStatusIconClass1?: string;
  headerTemplate1?: TemplateRef<any>;
  heading1 = '';
  minSize1 = 0;
  removeContentOnCollapse1 = false;
  scale1: Scale = 'auto';
  showCollapseButton1 = true;
  showHeader1 = true;
  collapseLabel1 = 'collapse';
  collapseChanged1 = (event: boolean): void => {};
  stateChange1 = (event: PartState): void => {};
  readonly splitPart2 = viewChild.required('splitPart2', { read: ElementRef });
  actions2: Action[] = [];
  collapseDirection2: CollapseTo = 'start';
  collapseIconClass2 = 'element-command-arrow';
  collapseToMinSize2 = false;
  headerTemplate2?: TemplateRef<any>;
  heading2 = '';
  minSize2 = 0;
  removeContentOnCollapse2 = false;
  scale2: Scale = 'auto';
  showCollapseButton2 = true;
  showHeader2 = true;
  collapseLabel2 = 'collapse';
  collapseChanged2 = (event: boolean): void => {};
  stateChange2 = (event: PartState): void => {};
  readonly splitPart3 = viewChild.required('splitPart3', { read: ElementRef });
  actions3: Action[] = [];
  collapseDirection3: CollapseTo = 'start';
  collapseIconClass3 = 'element-command-arrow';
  collapseToMinSize3 = false;
  headerTemplate3?: TemplateRef<any>;
  heading3 = '';
  minSize3 = 0;
  removeContentOnCollapse3 = false;
  scale3: Scale = 'auto';
  showCollapseButton3 = true;
  showHeader3 = true;
  collapseLabel3 = 'collapse';
  collapseOthers2 = true;
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

  private measureSize(element: ElementRef<HTMLElement>): number {
    if (this.orientation === 'horizontal') {
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
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SiSplitModule, WrapperComponent],
        providers
      }).compileComponents();
    }));
  };

  describe('using ui state service', () => {
    describe('without SiUIStateService', () => {
      setup();

      beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(WrapperComponent);
        fixture.detectChanges();
        wrapperComponent = fixture.componentInstance;
        element = fixture.nativeElement;
        wrapperComponent.split().sizes = [20, 60, 20];
        fixture.detectChanges();
      }));

      it('should create and set inputs', () => {
        expect(wrapperComponent).toBeTruthy();
        const split = element.querySelector('si-split')!.innerHTML;

        expect(split).toContain('Test 1');
        expect(split).toContain('Test 2');
        expect(split).toContain('Test 3');

        expect(wrapperComponent.split().sizes).toBeDefined();
        expect(wrapperComponent.split().sizes).toEqual([20, 60, 20]);
        expect(wrapperComponent.split().orientation).toEqual('horizontal');
      });
    });

    describe('with SiUIStateService', () => {
      setup(true);

      describe('but no persisted state', () => {
        beforeEach(waitForAsync(() => {
          fixture = TestBed.createComponent(WrapperComponent);
          fixture.detectChanges();
          wrapperComponent = fixture.componentInstance;
          element = fixture.nativeElement;
          wrapperComponent.split().sizes = [20, 60, 20];
          fixture.detectChanges();
        }));

        it('should create with ui state service', () => {
          expect(wrapperComponent).toBeTruthy();
          const split = element.querySelector('si-split')!.innerHTML;

          expect(split).toContain('Test 1');
          expect(split).toContain('Test 2');
          expect(split).toContain('Test 3');

          expect(wrapperComponent.split().sizes).toBeDefined();
          expect(wrapperComponent.split().sizes).toEqual([20, 60, 20]);
          expect(wrapperComponent.split().orientation).toEqual('horizontal');
        });

        it('should save ui state ', async () => {
          wrapperComponent.splitPart().toggleCollapse();
          const uiStateMock =
            await TestBed.inject(SI_UI_STATE_SERVICE).load<Record<string, any>>('split-test');

          expect(uiStateMock).toBeDefined();
          expect(uiStateMock!.one.expanded).toBeFalse();
          expect(uiStateMock!.two.expanded).toBeTrue();
          expect(uiStateMock!.three.expanded).toBeTrue();
        });
      });

      describe('with SiUIStateService and persisted state', () => {
        beforeEach(() => {
          const store = TestBed.inject(SI_UI_STATE_SERVICE);
          store.save('split-test', {
            one: { initialSize: 20, size: 40, expanded: true },
            two: { initialSize: 60, size: 40, expanded: true },
            three: { initialSize: 20, size: 20, expanded: true }
          });

          fixture = TestBed.createComponent(WrapperComponent);
          wrapperComponent = fixture.componentInstance;
          wrapperComponent.sizes = [20, 60, 20];
          // We need this here to run checks after async tasks completed.
          fixture.autoDetectChanges(true);
          element = fixture.nativeElement;
        });

        it('should load and configure split parts', async () => {
          await fixture.whenStable();
          expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize2()).toBeCloseTo(200, 0);
          expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);
          expect(wrapperComponent.split().orientation).toEqual('horizontal');
        });
      });
    });
  });

  describe('independent of ui state service', () => {
    setup();
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(WrapperComponent);
      wrapperComponent = fixture.componentInstance;
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
    }));

    describe('in horizontal orientation', () => {
      it('should display with set sizes and gutter size', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size while respecting min size after resize', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.minSize3 = 175;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(186, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(139, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(175, 0);

        wrapperComponent.containerWidth = 1064;
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(400, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(300, 0);
      });

      it('should display with set sizes and gutter size while keeping size with scale none after resize', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.scale3 = 'none';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();
        await new Promise(resolve => setTimeout(resolve));

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.containerWidth = 1064;
        await runOnPushChangeDetection(fixture);
        expect(wrapperComponent.measureSize1()).toBeCloseTo(486, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(364, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should collapse part on click if enabled', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement1.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(20, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(256, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(256, 0);
      });

      it('should collapse part to min size on click if set', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.collapseToMinSize1 = true;
        wrapperComponent.minSize1 = 50;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement1.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(50, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(241, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(241, 0);
      });

      it('should switch to vertical orientation', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.containerHeight = 564;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.orientation = 'vertical';
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size and resize on drag', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement2, 50, 50);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(58, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(242, 0);
      });

      it('should display with set sizes and gutter size and not resize on incorrect drag', async () => {
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

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
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.minSize3 = 100;
        wrapperComponent.scale1 = 'none';
        wrapperComponent.scale2 = 'auto';
        wrapperComponent.scale3 = 'none';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(1), 50, 50, partElement3, 50, 50);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);
      });

      if ('TouchEvent' in window) {
        it('should display with set sizes and gutter size and resize on touch drag', async () => {
          wrapperComponent.sizes = [40, 30, 30];
          wrapperComponent.containerWidth = 564;
          wrapperComponent.gutterSize = 32;
          await runOnPushChangeDetection(fixture);
          fixture.detectChanges();

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
        wrapperComponent.sizes = [20, 60, 20];
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);

        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should collapse all to the same side on click', async () => {
        wrapperComponent.orientation = 'horizontal';
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.collapseDirection2 = 'end';
        wrapperComponent.collapseDirection3 = 'end';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(524, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(20, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(20, 0);
      });

      it('should only collapse split part if collapseOthers2 is false', async () => {
        wrapperComponent.orientation = 'horizontal';
        wrapperComponent.sizes = [40, 20, 40];
        wrapperComponent.gutterSize = 32;
        wrapperComponent.containerWidth = 564;
        wrapperComponent.collapseDirection2 = 'end';
        wrapperComponent.collapseDirection3 = 'end';
        wrapperComponent.collapseOthers2 = false;
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(100);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(200);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(256);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(20);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(256);
      });
    });

    describe('in vertical orientation', () => {
      it('should display with set sizes and gutter size', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should switch to horizontal orientation', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        wrapperComponent.orientation = 'horizontal';
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size and resize on drag', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

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
          wrapperComponent.orientation = 'vertical';
          wrapperComponent.sizes = [40, 30, 30];
          await runOnPushChangeDetection(fixture);
          fixture.detectChanges();

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
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.minSize1 = 100;
        wrapperComponent.scale1 = 'none';
        wrapperComponent.scale2 = 'auto';
        wrapperComponent.scale3 = 'none';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        dragFromElementToElement(getSplitGuttersElements(0), 50, 50, partElement1, 50, 50);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(250, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should display with set sizes and gutter size after changes with scale none', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [20, 60, 20];
        wrapperComponent.scale1 = 'none';
        wrapperComponent.scale2 = 'none';
        wrapperComponent.scale3 = 'none';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(100, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(300, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(100, 0);

        wrapperComponent.sizes = [40, 30, 30];
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);
      });

      it('should collapse all to the same side on click', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement2.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(40, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(452, 0);
      });

      it('should switch to horizontal orientation after collapsed part on click', async () => {
        wrapperComponent.orientation = 'vertical';
        wrapperComponent.sizes = [40, 30, 30];
        wrapperComponent.collapseDirection3 = 'end';
        await runOnPushChangeDetection(fixture);
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(200, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(150, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(150, 0);

        partElement3.querySelector<HTMLElement>('.si-split-part-collapse-button button')!.click();
        fixture.detectChanges();

        expect(wrapperComponent.measureSize1()).toBeCloseTo(272, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(204, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(40, 0);

        wrapperComponent.orientation = 'horizontal';
        await runOnPushChangeDetection(fixture);

        expect(wrapperComponent.measureSize1()).toBeCloseTo(283, 0);
        expect(wrapperComponent.measureSize2()).toBeCloseTo(213, 0);
        expect(wrapperComponent.measureSize3()).toBeCloseTo(20, 0);
      });
    });
  });
});
