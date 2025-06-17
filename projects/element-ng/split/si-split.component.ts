/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  Output,
  QueryList,
  signal,
  Signal,
  SimpleChanges
} from '@angular/core';
import {
  isRTL,
  SI_UI_STATE_SERVICE,
  WebComponentContentChildren
} from '@siemens/element-ng/common';
import { asapScheduler, fromEvent, merge } from 'rxjs';
import { observeOn, takeUntil } from 'rxjs/operators';

import { SiSplitPartComponent } from './si-split-part.component';
import { SplitOrientation } from './si-split.interfaces';

interface Gutter {
  before: SiSplitPartComponent;
  after: SiSplitPartComponent;
  visible: Signal<boolean>;
}

interface SplitPartState {
  size: number;
  initialSize: number;
  expanded: boolean;
}

@Component({
  selector: 'si-split',
  templateUrl: './si-split.component.html',
  styleUrl: './si-split.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Signals cannot be used directly with @HostBinding. See: https://github.com/angular/angular/issues/53888#issuecomment-1888935225
  host: {
    '[class]': '_orientation()',
    '[style.grid-template-rows]': 'gridTemplateRows()',
    '[style.grid-template-columns]': 'gridTemplateColumns()',
    '[style.grid-template-areas]': 'gridTemplateAreas()'
  }
})
export class SiSplitComponent implements AfterContentInit, OnChanges {
  /** @defaultValue 16 */
  @Input() gutterSize = 16;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected readonly _orientation = signal<SplitOrientation>('horizontal');

  get orientation(): SplitOrientation {
    return this._orientation();
  }

  @Input() set orientation(value: SplitOrientation) {
    this._orientation.set(value);
  }

  /** @defaultValue [] */
  @Input() sizes: number[] = [];

  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  @Input() stateId?: string;

  @Output() readonly sizesChange = new EventEmitter<number[]>();

  @WebComponentContentChildren(SiSplitPartComponent)
  @ContentChildren(SiSplitPartComponent)
  protected parts!: QueryList<SiSplitPartComponent>;
  protected gutters: Gutter[] = [];

  // eslint-disable-next-line
  protected gridTemplateRows: Signal<string> = signal('');
  // eslint-disable-next-line
  protected gridTemplateColumns: Signal<string> = signal('');
  // eslint-disable-next-line
  protected gridTemplateAreas: Signal<string> = signal('');

  private elementRef = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);
  private uiStateService = inject(SI_UI_STATE_SERVICE, { optional: true });
  // New parts won't be measured, so we need this to scale up their fractional size to the expanded size.
  // Using 10, as the sum of all fractional sizes is 1, so we need to scale them up as fr-values should be >= 1.
  private fractionalSizeToExpandedSizeFactor = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sizes && !changes.sizes.firstChange) {
      this.sizes.forEach((size, index) => {
        const part = this.parts.get(index);
        if (part) {
          part.fractionalSize.set(size);
          part.expandedSize.set(undefined);
        }
      });
      this.alignRelativeSizes();
    }
  }

  ngAfterContentInit(): void {
    this.parts.changes.pipe(observeOn(asapScheduler)).subscribe(() => {
      this.changeDetectorRef.markForCheck();
      this.gutters = [];

      for (let index = 0; index < this.parts.length; index++) {
        const component = this.parts.get(index)!;
        component.index = index;
        component.after = this.parts.get(index + 1);
        component.before = this.parts.get(index - 1);
        component.fractionalSize.set(this.sizes[index]);
        component.saveUIState = () => this.saveUIState();

        if (component.after) {
          this.gutters.push({
            before: component,
            after: this.parts.get(index + 1)!,
            visible: computed(() => {
              const afterPart = component.after!.nextExpandedAfter();
              return !afterPart.collapsedState() && !component.collapsedState();
            })
          });
        }
      }

      this.alignRelativeSizes();
      this.updateFractionalSizeToExpandSizeFactor();
      this.restoreFormUIState();

      const gridTemplate = computed(() =>
        this.parts
          .map(part =>
            part.collapsedState()
              ? part.collapseToMinSize
                ? `${part.minSize}px`
                : 'min-content'
              : part.actualSize()
                ? part.scale === 'auto'
                  ? `minmax(${part.minSize}px, ${part.actualSize()}fr)`
                  : `minmax(${part.minSize}px, ${part.actualSize()}px)`
                : `minmax(${part.minSize}px, ${
                    part.fractionalSize()! * this.fractionalSizeToExpandedSizeFactor
                  }fr)`
          )
          .join(' min-content ')
      );

      this.gridTemplateRows = computed(() =>
        this._orientation() === 'vertical' ? gridTemplate() : '1fr'
      );
      this.gridTemplateColumns = computed(() =>
        this._orientation() === 'horizontal' ? gridTemplate() : '1fr'
      );
      this.gridTemplateAreas = computed(() => {
        const areaNames = this.parts
          .map((part, index) => [`p-${index}`, part.after ? `g-${index}` : []])
          .flat(2) as string[];

        if (this._orientation() === 'horizontal') {
          return `"${areaNames.join(' ')}"`;
        } else {
          return `"${areaNames.join('" "')}"`;
        }
      });
      setTimeout(() => this.refreshAllPartSizes());
    });
    this.parts.notifyOnChanges();
  }

  private alignRelativeSizes(): void {
    const requestedNoSize = this.parts.filter(part => !part.size && !part.fractionalSize());
    const requestedRelSize = this.parts.filter(part => part.fractionalSize() && !part.size);

    if (requestedRelSize.length) {
      const totalRequestedRelSize = requestedRelSize.reduce((a, b) => a + b.fractionalSize()!, 0);
      const averageRelSize = totalRequestedRelSize / requestedRelSize.length;
      const totalAssignedRelSize = totalRequestedRelSize + requestedNoSize.length * averageRelSize;
      requestedNoSize.forEach(part =>
        part.fractionalSize.set(averageRelSize / totalAssignedRelSize)
      );
      requestedRelSize.forEach(part =>
        part.fractionalSize.set(part.fractionalSize()! / totalAssignedRelSize)
      );
    } else {
      requestedNoSize.forEach(part => part.fractionalSize.set(1 / requestedNoSize.length));
    }
  }

  private updateFractionalSizeToExpandSizeFactor(): void {
    let previousScalableFractionalSum = 0;
    let previousScalableExpandedSizeSum = 0;

    for (let index = 0; index < this.parts.length; index++) {
      const component = this.parts.get(index)!;
      if (component.scale === 'auto' && component.expandedSize() !== undefined) {
        previousScalableExpandedSizeSum += component.expandedSize()!;
        previousScalableFractionalSum += component.fractionalSize()!;
      }
    }

    this.fractionalSizeToExpandedSizeFactor = previousScalableFractionalSum
      ? previousScalableExpandedSizeSum / previousScalableFractionalSum
      : 10;
  }

  private refreshAllPartSizes(): void {
    const refParts = this.parts.filter(
      part =>
        !part.collapsedState() &&
        part.scale === 'auto' &&
        (part.expandedSize() || part.fractionalSize())
    );
    const beforeFrSum = refParts.reduce((a, b) => a + (b.expandedSize() ?? b.fractionalSize()!), 0);
    this.parts.forEach(part => part.refreshSizePx(this.orientation));
    const afterFrSum = refParts.reduce((a, b) => a + b.expandedSize()!, 0);
    const beforeToAfterFactor = afterFrSum / beforeFrSum;
    this.parts
      .filter(
        part =>
          part.collapsedState() && (part.scale === 'auto' || part.expandedSize() === undefined)
      )
      .forEach(part =>
        part.expandedSize.update(prev => (prev ?? part.fractionalSize()!) * beforeToAfterFactor)
      );
  }

  protected resizeStart(gutter: Gutter, event: Event): void {
    this.refreshAllPartSizes();
    this.changeDetectorRef.detectChanges();
    const afterPart = gutter.after.nextExpandedAfter();
    let beforeSize = gutter.before.expandedSize()!;
    let afterSize = afterPart.expandedSize()!;
    let appliedDelta = 0;
    const rtl = isRTL();
    const startPosition = this.getPosition(event);
    const minDelta = -1 * (beforeSize - gutter.before.minSize);
    const maxDelta = afterSize - afterPart.minSize;
    const containerSize = this.measureContainerSize();
    event.preventDefault(); // prevents text-selection

    this.ngZone.runOutsideAngular(() => {
      merge(fromEvent(this.document, 'mousemove'), fromEvent(this.document, 'touchmove'))
        .pipe(
          takeUntil(
            merge(fromEvent(this.document, 'mouseup'), fromEvent(this.document, 'touchend'))
          )
        )
        .subscribe({
          next: move => {
            let delta = this.getPosition(move) - startPosition;
            if (rtl && this.orientation === 'horizontal') {
              delta *= -1;
            }

            delta -= appliedDelta;
            if (maxDelta < appliedDelta + delta) {
              delta = maxDelta - appliedDelta;
            } else if (minDelta > appliedDelta + delta) {
              delta = minDelta - appliedDelta;
            }

            if (delta === 0) {
              return;
            }

            beforeSize += delta;
            afterSize -= delta;
            appliedDelta += delta;
            gutter.before.expandedSize.set(beforeSize);
            afterPart.expandedSize.set(afterSize);
            if (this.orientation === 'vertical') {
              this.elementRef.nativeElement.style.setProperty(
                'grid-template-rows',
                this.gridTemplateRows()
              );
            } else {
              this.elementRef.nativeElement.style.setProperty(
                'grid-template-columns',
                this.gridTemplateColumns()
              );
            }
            this.ngZone.run(() =>
              this.sizesChange.emit(
                this.parts.map(part => (part.actualSize() * 100) / containerSize)
              )
            );
          },
          complete: () => this.saveUIState()
        });
    });
  }

  private measureContainerSize(): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    if (this._orientation() === 'vertical') {
      return rect.height;
    } else {
      return rect.width;
    }
  }

  private getPosition(event: Event): number {
    const positionObject = (event as TouchEvent).touches?.[0] ?? (event as MouseEvent);
    return this.orientation === 'horizontal'
      ? (positionObject.clientX ?? 0)
      : (positionObject.clientY ?? 0);
  }

  private saveUIState(): void {
    if (!this.stateId || !this.uiStateService) {
      return;
    }

    const containerSize = this.measureContainerSize();
    const state = this.parts.reduce(
      (partState, part) => {
        if (part.stateId) {
          partState[part.stateId] = {
            size: ((part.expandedSize() ?? 0) * 100) / containerSize,
            initialSize: this.sizes[part.index],
            expanded: part.expanded
          };
        }
        return partState;
      },
      {} as Record<string, SplitPartState>
    );

    this.uiStateService.save(this.stateId, state);
  }

  private restoreFormUIState(): void {
    if (!this.stateId || !this.uiStateService) {
      return;
    }

    this.uiStateService.load<Record<string, SplitPartState>>(this.stateId).then(uiState => {
      if (!uiState) {
        return;
      }

      this.parts
        .filter(part => part.stateId)
        .map(part => ({ part, state: uiState[part.stateId!] }))
        .filter(({ part, state }) => this.sizes[part.index] === state?.initialSize)
        .forEach(({ part, state }) => {
          part.expandedSize.set(undefined);
          part.fractionalSize.set(state?.size);
          part.collapsedState.set(!(state?.expanded ?? true));
        });
      setTimeout(() => this.refreshAllPartSizes());
    });
  }
}
