/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  SimpleChanges
} from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';
import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
import { SiSplitComponent, SiSplitPartComponent } from '@siemens/element-ng/split';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

/** @experimental */
@Component({
  selector: 'si-list-details',
  imports: [NgTemplateOutlet, SiSplitComponent, SiSplitPartComponent],
  templateUrl: './si-list-details.component.html',
  styleUrl: './si-list-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'si-layout-inner list-details-layout d-flex flex-column',
    '[class.expanded]': 'hasLargeSize()',
    '[style.opacity]': 'opacity()'
  },
  animations: [
    trigger('detailsExpanded', [
      state(
        'collapsed',
        style({
          marginInlineStart: '0'
        })
      ),
      state(
        'expanded',
        style({
          marginInlineStart: '-100%'
        })
      ),
      transition('collapsed <=> expanded', [animate('0.5s ease-in-out')])
    ])
  ]
})
export class SiListDetailsComponent implements OnInit, OnChanges, OnDestroy {
  private resizeSubs?: Subscription;
  private elementRef = inject(ElementRef);
  private resizeObserver = inject(ResizeObserverService);
  private readonly animationsGloballyDisabled = areAnimationsDisabled();

  /**
   * A numeric value defining the minimum width in px, which the component needs
   * to be displayed in its large layout. Whenever smaller than
   * this threshold, the small layout will be used. Default is
   * value is BOOTSTRAP_BREAKPOINTS.mdMinimum.
   *
   * @defaultValue BOOTSTRAP_BREAKPOINTS.mdMinimum
   */
  readonly expandBreakpoint = input(BOOTSTRAP_BREAKPOINTS.mdMinimum);

  readonly hasLargeSize = computed(() => {
    const dimensions = this.resizeDimensions();
    return !!dimensions && dimensions.width >= this.expandBreakpoint();
  });

  /**
   * Whether the details are currently active or not, mostly relevant in the
   * responsive scenario when the viewport only shows either the list or the detail.
   *
   * @defaultValue false
   */
  readonly detailsActive = model(false);

  /**
   * Whether the list and detail parts should be resizable by a splitter or not.
   * This is only supported in the 'large' scenario (when `hasLargeSize` is `true`).
   * Default value is `false`.
   *
   * @defaultValue false
   */
  readonly disableResizing = input(false, { transform: booleanAttribute });

  /**
   * The percentage width of the list view of the overall component width.
   * Can be a number or `'default'`, which is 32%.
   *
   * @defaultValue 'default'
   */
  readonly listWidth = model<number | 'default'>('default');

  /**
   * Sets the minimal width of the list component in pixel.
   *
   * @defaultValue 300
   */
  readonly minListSize = input(300);

  /**
   * Sets the minimal width of the detail component in pixel.
   *
   * @defaultValue 300
   */
  readonly minDetailsSize = input(300);

  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  readonly stateId = input<string>();

  private readonly actualListWidth = computed(() => {
    const listWidth = this.listWidth();
    return listWidth === 'default' ? 32 : listWidth;
  });

  protected readonly splitSizes = computed<[number, number]>(() => [
    this.actualListWidth(),
    100 - this.actualListWidth()
  ]);
  /**
   * The max size to limit the list view in the static flex layout (if less than 50%), otherwise not set.
   * @internal
   */
  readonly maxListSize = this.getMaxSize(0);
  /**
   * The max size to limit the details view in the static flex layout (if less than 50%), otherwise not set.
   * @internal
   */
  readonly maxDetailsSize = this.getMaxSize(1);

  protected readonly listStateId = computed(() => {
    const stateId = this.stateId();
    return stateId ? `${stateId}-list` : undefined;
  });

  protected readonly detailsStateId = computed(() => {
    const stateId = this.stateId();
    return stateId ? `${stateId}-details` : undefined;
  });

  protected readonly opacity = computed(() => (this.resizeDimensions() ? '' : '0'));

  /** @internal */
  readonly detailsExpandedAnimation = computed(() => {
    if (!this.animationsGloballyDisabled && !this.hasLargeSize()) {
      return this.detailsActive() ? 'expanded' : 'collapsed';
    } else {
      return 'disabled';
    }
  });

  // Used for focus transfer, can not use a focus trap for this.
  private hadLargeSizePreviously: boolean | undefined;
  private detailsActivePreviously: boolean | undefined;
  private previouslyFocusedElementInList: HTMLElement | undefined;

  /** @internal */
  readonly transferFocusToList = new Subject<HTMLElement | undefined>();
  /**
   * A behavior subject because the details component may only be created when details are visible.
   * @internal
   */
  readonly transferFocusToDetails = new BehaviorSubject<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.detailsActive) {
      this.transferFocus();
    }
  }

  ngOnInit(): void {
    this.resizeSubs = this.resizeObserver
      .observe(this.elementRef.nativeElement, 100, true)
      .subscribe(dimensions => {
        this.resizeDimensions.set(dimensions);
        this.transferFocus();
      });
  }

  ngOnDestroy(): void {
    this.resizeSubs?.unsubscribe();
  }

  private readonly resizeDimensions = signal<ElementDimensions | undefined>(undefined);

  protected onSplitSizesChange(sizes: number[]): void {
    this.listWidth.set(sizes[0]);
  }

  /** @internal */
  detailsBackClicked(): void {
    this.detailsActive.set(false);
  }

  // Transfer focus onto child panes if they would be inaccesible.
  private transferFocus(): void {
    // Check if dimensions have even been evaluated.
    const hasLargeSize = this.resizeDimensions() ? this.hasLargeSize() : undefined;
    const detailsActive = this.detailsActive();
    if (this.hadLargeSizePreviously !== undefined && this.detailsActivePreviously !== undefined) {
      if (
        detailsActive &&
        !hasLargeSize &&
        (!this.detailsActivePreviously || this.hadLargeSizePreviously)
      ) {
        if (!this.hadLargeSizePreviously) {
          this.previouslyFocusedElementInList = document?.activeElement as HTMLElement | undefined;
        }
        this.transferFocusToDetails.next(true);
      }
      if (!detailsActive && this.detailsActivePreviously) {
        this.transferFocusToList.next(this.previouslyFocusedElementInList);
        this.previouslyFocusedElementInList = undefined;
      }
    }
    this.hadLargeSizePreviously = hasLargeSize;
    this.detailsActivePreviously = detailsActive;
  }

  /**
   * Get the max size to limit in the static flex layout (if less than 50%), otherwise not set
   */
  private getMaxSize(part: 0 | 1): Signal<string> {
    return computed(() =>
      !this.disableResizing() ||
      this.listWidth() === 'default' ||
      !this.hasLargeSize() ||
      this.splitSizes()[part] > 50
        ? ''
        : this.splitSizes()[part] + '%'
    );
  }
}
