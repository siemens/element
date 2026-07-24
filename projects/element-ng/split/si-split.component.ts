/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
  signal,
  Signal
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
import { SplitOrientation, SplitUnit } from './si-split.interfaces';

interface Gutter {
  before: SiSplitPartComponent;
  after: SiSplitPartComponent;
  visible: Signal<boolean>;
}

interface SplitPartState {
  size: number;
  initialSize: number;
  initialUnit: SplitUnit;
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
          : part.sizeUnit() === 'px'
            ? `minmax(${part.minSize()}px, ${part.expandedSize() ?? part.sizeValue()}px)`
            : `minmax(${part.minSize()}px, ${
                part.fractionalSize()! *
                (part.expandedSize() === undefined ? this.fractionalSizeToExpandedSizeFactor() : 1)
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
  // Existing fr parts are measured in pixels after layout or dragging, so their fr weights become
  // pixel-derived. A newly added fr part has not been measured yet and still has its configured
  // weight. This factor converts that configured weight into the same scale until it is measured.
  // It is the ratio of measured expanded sizes to configured weights of visible measured fr parts.
  private readonly fractionalSizeToExpandedSizeFactor = computed(() => {
    const measuredParts = this.parts().filter(
      part =>
        !part.collapsedState() && part.sizeUnit() === 'fr' && part.expandedSize() !== undefined
    );
    const configuredSizeSum = measuredParts.reduce(
      (sum, part) => sum + (part.initialFractionalSize() ?? part.sizeValue()),
      0
    );
    const expandedSizeSum = measuredParts.reduce((sum, part) => sum + part.expandedSize()!, 0);

    return configuredSizeSum ? expandedSizeSum / configuredSizeSum : 1;
  });
  private readonly initialized = signal(false);

  constructor() {
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

    this.restoreFromUIState();
    setTimeout(() => this.refreshAllPartSizes());
  }

  private refreshAllPartSizes(): void {
    this.parts().forEach(part => {
      part.refreshSizePx(this.orientation());
      if (!part.collapsedState() && part.sizeUnit() === 'fr') {
        part.fractionalSize.set(part.expandedSize()!);
      }
    });
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
            if (gutter.before.sizeUnit() === 'fr') {
              gutter.before.fractionalSize.set(beforeSize);
            }
            if (afterPart.sizeUnit() === 'fr') {
              afterPart.fractionalSize.set(afterSize);
            }
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
          complete: () => {
            this.ngZone.run(() => {
              this.parts().forEach(part => part.commitValue());
              this.saveUIState();
            });
          }
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

    const state = this.parts().reduce(
      (partState, part) => {
        const partStateId = part.stateId();
        if (partStateId) {
          const unit = part.sizeUnit();
          partState[partStateId] = {
            size: unit === 'px' ? part.expandedSize()! : part.fractionalSize()!,
            initialSize: part.sizeValue(),
            initialUnit: part.sizeUnit(),
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
        .filter(
          (item): item is { part: SiSplitPartComponent; state: SplitPartState } =>
            !!item.state &&
            item.state.initialSize === item.part.sizeValue() &&
            item.state.initialUnit === item.part.sizeUnit()
        )
        .forEach(({ part, state }) => {
          if (part.sizeUnit() === 'px') {
            part.expandedSize.set(state.size);
          } else {
            part.fractionalSize.set(state.size);
          }
          part.collapsedState.set(!state.expanded);
        });
      setTimeout(() => this.refreshAllPartSizes());
    });
  }
}
