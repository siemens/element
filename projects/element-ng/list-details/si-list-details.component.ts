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
   *
   * @defaultValue 32
   */
  readonly listWidth = model<number>(32);

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

  protected readonly splitSizes = computed<[number, number]>(() => [
    this.listWidth(),
    100 - this.listWidth()
  ]);

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

  private animationDone?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.detailsActive) {
      this.transferFocus();
    }
  }

  ngOnInit(): void {
    this.resizeSubs = this.resizeObserver
      .observe(this.elementRef.nativeElement, { throttle: 100, emitInitial: true })
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
  detailsBackClicked(options?: { animationDone?: () => void }): void {
    this.detailsActive.set(false);
    // This callback is used to route after the animation is done.
    this.animationDone = options?.animationDone;
  }

  protected detailsExpandedAnimationDone(): void {
    if (this.animationDone) {
      this.animationDone();
      this.animationDone = undefined;
    }
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
}
