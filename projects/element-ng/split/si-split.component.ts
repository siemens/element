/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  Signal,
  DOCUMENT,
  DestroyRef,
  output,
  effect,
  untracked
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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
  host: {
    '[class]': 'orientation()',
    '[style.grid-template-rows]': 'gridTemplateRows()',
    '[style.grid-template-columns]': 'gridTemplateColumns()',
    '[style.grid-template-areas]': 'gridTemplateAreas()'
  }
})
export class SiSplitComponent {
  /**
   * Size of the gutter (divider) between split parts in pixels.
   *
   * @defaultValue 16
   */
  readonly gutterSize = input(16);

  /**
   * Defines the split layout direction.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation = input<SplitOrientation>('horizontal');

  /**
   * Initial relative sizes of the split parts as fractional values.
   *
   * @defaultValue []
   */
  // eslint-disable-next-line @angular-eslint/prefer-signal-model
  readonly sizes = input<number[]>([]);

  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  readonly stateId = input<string>();

  readonly sizesChange = output<number[]>();

  @WebComponentContentChildren(SiSplitPartComponent)
  protected readonly parts = contentChildren(SiSplitPartComponent);
  protected readonly gutters = signal<Gutter[]>([]);

  private readonly gridTemplate = computed(() => {
    if (!this.initialized()) {
      return '';
    }
    return this.parts()
      .map(part =>
        part.collapsedState()
          ? part.collapseToMinSize()
            ? `${part.minSize()}px`
            : 'min-content'
          : part.actualSize()
            ? part.scale() === 'auto'
              ? `minmax(${part.minSize()}px, ${part.actualSize()}fr)`
              : `minmax(${part.minSize()}px, ${part.actualSize()}px)`
            : `minmax(${part.minSize()}px, ${
                part.fractionalSize()! * this.fractionalSizeToExpandedSizeFactor()
              }fr)`
      )
      .join(' min-content ');
  });

  protected readonly gridTemplateRows = computed(() =>
    this.orientation() === 'vertical' ? this.gridTemplate() : '1fr'
  );

  protected readonly gridTemplateColumns = computed(() =>
    this.orientation() === 'horizontal' ? this.gridTemplate() : '1fr'
  );

  protected readonly gridTemplateAreas = computed(() => {
    if (!this.initialized()) {
      return '';
    }
    const areaNames = this.parts()
      .map((part, index) => [`p-${index}`, part.after() ? `g-${index}` : []])
      .flat(2) as string[];

    if (this.orientation() === 'horizontal') {
      return `"${areaNames.join(' ')}"`;
    } else {
      return `"${areaNames.join('" "')}"`;
    }
  });

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly document = inject(DOCUMENT);
  private readonly uiStateService = inject(SI_UI_STATE_SERVICE, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  // New parts won't be measured, so we need this to scale up their fractional size to the expanded size.
  // Using 10, as the sum of all fractional sizes is 1, so we need to scale them up as fr-values should be >= 1.
  private readonly fractionalSizeToExpandedSizeFactor = signal(10);
  private readonly initialized = signal(false);

  constructor() {
    effect(() => {
      const sizes = this.sizes();
      untracked(() => {
        if (!this.initialized()) {
          return;
        }
        sizes.forEach((size, index) => {
          const part = this.parts()[index];
          if (part) {
            part.fractionalSize.set(size);
            part.expandedSize.set(undefined);
          }
        });
        this.alignRelativeSizes();
      });
    });

    toObservable(this.parts)
      .pipe(observeOn(asapScheduler), takeUntilDestroyed())
      .subscribe(() => this.setupParts());
  }

  private setupParts(): void {
    this.initialized.set(true);
    const gutters: Gutter[] = [];

    const parts = this.parts();
    for (let index = 0; index < parts.length; index++) {
      const component = parts[index];
      component.index = index;
      component.after.set(parts[index + 1]);
      component.before.set(parts[index - 1]);
      component.fractionalSize.set(this.sizes()[index]);
      component.saveUIState = () => this.saveUIState();

      if (component.after()) {
        gutters.push({
          before: component,
          after: parts[index + 1]!,
          visible: computed(() => {
            const afterPart = component.after()!.nextExpandedAfter();
            return !afterPart.collapsedState() && !component.collapsedState();
          })
        });
      }
    }
    this.gutters.set(gutters);

    this.alignRelativeSizes();
    this.updateFractionalSizeToExpandSizeFactor();
    this.restoreFromUIState();
    setTimeout(() => this.refreshAllPartSizes());
  }

  private alignRelativeSizes(): void {
    const parts = this.parts();
    const requestedNoSize = parts.filter(part => !part.size() && !part.fractionalSize());
    const requestedRelSize = parts.filter(part => part.fractionalSize() && !part.size());

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

    for (const component of this.parts()) {
      if (component.scale() === 'auto' && component.expandedSize() !== undefined) {
        previousScalableExpandedSizeSum += component.expandedSize()!;
        previousScalableFractionalSum += component.fractionalSize()!;
      }
    }

    this.fractionalSizeToExpandedSizeFactor.set(
      previousScalableFractionalSum
        ? previousScalableExpandedSizeSum / previousScalableFractionalSum
        : 10
    );
  }

  private refreshAllPartSizes(): void {
    const parts = this.parts();
    const refParts = parts.filter(
      part =>
        !part.collapsedState() &&
        part.scale() === 'auto' &&
        (part.expandedSize() || part.fractionalSize())
    );
    const beforeFrSum = refParts.reduce((a, b) => a + (b.expandedSize() ?? b.fractionalSize()!), 0);
    parts.forEach(part => part.refreshSizePx(this.orientation()));
    const afterFrSum = refParts.reduce((a, b) => a + b.expandedSize()!, 0);
    const beforeToAfterFactor = beforeFrSum > 0 ? afterFrSum / beforeFrSum : 1;
    parts
      .filter(
        part =>
          part.collapsedState() && (part.scale() === 'auto' || part.expandedSize() === undefined)
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
    const minDelta = -1 * (beforeSize - gutter.before.minSize());
    const maxDelta = afterSize - afterPart.minSize();
    const containerSize = this.measureContainerSize();
    event.preventDefault(); // prevents text-selection

    this.ngZone.runOutsideAngular(() => {
      merge(fromEvent(this.document, 'mousemove'), fromEvent(this.document, 'touchmove'))
        .pipe(
          takeUntil(
            merge(fromEvent(this.document, 'mouseup'), fromEvent(this.document, 'touchend'))
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: move => {
            let delta = this.getPosition(move) - startPosition;
            if (rtl && this.orientation() === 'horizontal') {
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
            if (this.orientation() === 'vertical') {
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
                this.parts().map(part => (part.actualSize() * 100) / containerSize)
              )
            );
          },
          complete: () => this.saveUIState()
        });
    });
  }

  private measureContainerSize(): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    if (this.orientation() === 'vertical') {
      return rect.height;
    } else {
      return rect.width;
    }
  }

  private getPosition(event: Event): number {
    const positionObject = (event as TouchEvent).touches?.[0] ?? (event as MouseEvent);
    return this.orientation() === 'horizontal'
      ? (positionObject.clientX ?? 0)
      : (positionObject.clientY ?? 0);
  }

  private saveUIState(): void {
    const stateId = this.stateId();
    if (!stateId || !this.uiStateService) {
      return;
    }

    const containerSize = this.measureContainerSize();
    const state = this.parts().reduce(
      (partState, part) => {
        const partStateId = part.stateId();
        if (partStateId) {
          partState[partStateId] = {
            size: ((part.expandedSize() ?? 0) * 100) / containerSize,
            initialSize: this.sizes()[part.index],
            expanded: !part.collapsedState()
          };
        }
        return partState;
      },
      {} as Record<string, SplitPartState>
    );

    this.uiStateService.save(stateId, state);
  }

  private restoreFromUIState(): void {
    const stateId = this.stateId();
    if (!stateId || !this.uiStateService) {
      return;
    }

    this.uiStateService.load<Record<string, SplitPartState>>(stateId).then(uiState => {
      if (!uiState) {
        return;
      }

      this.parts()
        .filter(part => part.stateId())
        .map(part => ({ part, state: uiState[part.stateId()!] }))
        .filter(({ part, state }) => this.sizes()[part.index] === state?.initialSize)
        .forEach(({ part, state }) => {
          part.expandedSize.set(undefined);
          part.fractionalSize.set(state?.size);
          part.collapsedState.set(!(state?.expanded ?? true));
        });
      setTimeout(() => this.refreshAllPartSizes());
    });
  }
}
