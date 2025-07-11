/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostBinding,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  SimpleChanges
} from '@angular/core';
import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
import { SiSplitComponent, SiSplitPartComponent } from '@siemens/element-ng/split';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { Subscription } from 'rxjs';

@Component({
  selector: 'si-main-detail-container',
  imports: [NgClass, NgTemplateOutlet, SiSplitComponent, SiSplitPartComponent, SiTranslateModule],
  templateUrl: './si-main-detail-container.component.html',
  styleUrl: './si-main-detail-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'si-layout-inner' }
})
export class SiMainDetailContainerComponent implements OnInit, OnChanges, OnDestroy {
  private animationDuration = 500;
  private resizeSubs?: Subscription;
  private elementRef = inject(ElementRef);
  private resizeObserver = inject(ResizeObserverService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  /**
   * A numeric value defining the minimum width in px, which the container needs
   * to be displayed in its large layout. Whenever smaller than
   * this threshold, the small layout will be used. Default is
   * value is BOOTSTRAP_BREAKPOINTS.mdMinimum.
   *
   * @defaultValue BOOTSTRAP_BREAKPOINTS.mdMinimum
   */
  readonly largeLayoutBreakpoint = input(BOOTSTRAP_BREAKPOINTS.mdMinimum);

  /**
   * Whether the main-detail layout component has a large size or not,
   * `true` if the container´s width matches or exceeds the `largeLayoutBreakpoint`.
   */
  hasLargeSize!: boolean;

  /**
   * Emits whether the components size is large enough to display
   * main and details views next to each other or not.
   */
  readonly hasLargeSizeChange = output<boolean>();

  /**
   * Whether the details are currently active or not, mostly relevant in the
   * responsive scenario when the viewport only shows either the main or the detail.
   *
   * @defaultValue false
   */
  readonly detailsActive = model(false);

  /**
   * The heading of the main-detail layout component, usually a page heading.
   *
   * @defaultValue ''
   */
  readonly heading = input('');

  /**
   * Whether the heading should be truncated (single line) or not.
   * Default value is `false`.
   *
   * @defaultValue false
   */
  readonly truncateHeading = input(false, { transform: booleanAttribute });

  /**
   * The heading of the detail area.
   *
   * @defaultValue ''
   */
  readonly detailsHeading = input('');

  /**
   * Whether the main and detail parts should be resizable by a splitter or not.
   * This is only supported in the 'large' scenario (when `hasLargeSize` is `true`).
   * Default value is `false`.
   *
   * @defaultValue false
   */
  readonly resizableParts = input(false, { transform: booleanAttribute });

  /**
   * You can hide the back button in the mobile view by setting true. Required
   * in add, edit workflows on mobile sizes. During add or edit, the back button
   * should be hidden. Default value is `false`.
   *
   * @defaultValue false
   */
  readonly hideBackButton = input(false, { transform: booleanAttribute });

  /**
   * Details back button text. Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_MAIN_DETAIL_CONTAINER.BACK:Back`
   * ```
   */
  readonly detailsBackButtonText = input($localize`:@@SI_MAIN_DETAIL_CONTAINER.BACK:Back`);

  /**
   * CSS class(es) applied to the outermost container. Per default, Bootstrap classes
   * to handle responsive paddings are applied: `px-6 pt-6 px-md-9`.
   *
   * @defaultValue 'px-6 pt-6 px-md-9'
   */
  readonly containerClass = input('px-6 pt-6 px-md-9');

  /**
   * CSS class(es) applied to the main container. In combination with `containerClass`,
   * this allows for settings individual padding and margin values on the individual containers.
   *
   * @defaultValue 'pb-6'
   */
  readonly mainContainerClass = input('pb-6');

  /**
   * CSS class(es) applied to the detail container. In combination with `containerClass`,
   * this allows for settings individual padding and margin values on the individual containers.
   *
   * @defaultValue 'pb-6'
   */
  readonly detailContainerClass = input('pb-6');

  /**
   * The percentage width of the main container from the overall component width.
   * Can be a number or `'default'`, which is 32% when {@link resizableParts} is active, otherwise 50%.
   *
   * @defaultValue 'default'
   */
  readonly mainContainerWidth = model<number | 'default'>('default');
  /**
   * Sets the minimal width of the main container in pixel.
   *
   * @defaultValue 300
   */
  readonly minMainSize = input(300);
  /**
   * Sets the minimal width of the detail container in pixel.
   *
   * @defaultValue 300
   */
  readonly minDetailSize = input(300);
  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  readonly stateId = input<string>();

  /**
   * The attribute is set to true when the detail area is not visible to ensure that the user
   * can't tab to details area when it is hidden.
   */
  protected preventFocusDetails = false;

  private readonly actualMainContainerWidth = computed(() => {
    const mainContainerWidth = this.mainContainerWidth();
    return mainContainerWidth === 'default'
      ? this.resizableParts()
        ? 32
        : 50
      : mainContainerWidth;
  });

  protected splitSizes: [number, number] = [
    this.actualMainContainerWidth(),
    100 - this.actualMainContainerWidth()
  ];
  // The max size to limit the main container in the static flex layout (if less than 50%), otherwise not set.
  protected maxMainSize: string = this.getMaxSize(0);
  // The max size to limit the detail container in the static flex layout (if less than 50%), otherwise not set.
  protected maxDetailSize: string = this.getMaxSize(1);

  protected readonly mainStateId = computed(() => {
    const stateId = this.stateId();
    return stateId ? `${stateId}-main` : undefined;
  });

  protected readonly detailStateId = computed(() => {
    const stateId = this.stateId();
    return stateId ? `${stateId}-detail` : undefined;
  });

  @HostBinding('class.animate') protected animate = false;

  @HostBinding('style.opacity') protected opacity = '0';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.detailsActive) {
      this.updateDetailsFocusable();
      this.doAnimation(changes.detailsActive.currentValue);
    }
    if (changes.mainContainerWidth || changes.resizableParts) {
      this.splitSizes = [this.actualMainContainerWidth(), 100 - this.actualMainContainerWidth()];
      this.maxMainSize = this.getMaxSize(0);
      this.maxDetailSize = this.getMaxSize(1);
    }
  }

  ngOnInit(): void {
    this.resizeSubs = this.resizeObserver
      .observe(this.elementRef.nativeElement, 100, true)
      .subscribe(dimensions => this.determineLayout(dimensions));
  }

  ngOnDestroy(): void {
    this.resizeSubs?.unsubscribe();
  }

  protected onSplitSizesChange(sizes: number[]): void {
    this.mainContainerWidth.set(sizes[0]);
  }

  protected detailsBackClicked(): void {
    this.detailsActive.set(false);
    this.doAnimation(false);
  }

  /**
   * Get the max size to limit in the static flex layout (if less than 50%), otherwise not set
   */
  private getMaxSize(part: 0 | 1): string {
    return this.resizableParts() ||
      this.mainContainerWidth() === 'default' ||
      !this.hasLargeSize ||
      this.splitSizes[part] > 50
      ? ''
      : this.splitSizes[part] + '%';
  }

  private determineLayout(dimensions: ElementDimensions): void {
    const newHasLargeSize = dimensions.width >= this.largeLayoutBreakpoint();
    if (this.hasLargeSize !== newHasLargeSize) {
      this.hasLargeSize = newHasLargeSize;
      this.maxMainSize = this.getMaxSize(0);
      this.maxDetailSize = this.getMaxSize(1);
      this.updateDetailsFocusable();
      this.hasLargeSizeChange.emit(this.hasLargeSize);
      this.changeDetectorRef.markForCheck();
    }
    if (this.opacity === '0') {
      this.opacity = '';
      this.changeDetectorRef.markForCheck();
    }
  }

  private doAnimation(detailsActive: boolean): void {
    this.animate = true;
    setTimeout(() => {
      this.animate = false;
      this.changeDetectorRef.markForCheck();
    }, this.animationDuration);
    this.detailsActive.set(detailsActive);
  }

  private updateDetailsFocusable(): void {
    this.preventFocusDetails = !this.hasLargeSize && !this.detailsActive();
  }
}
