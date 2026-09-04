/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementBack } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
import { SiSplitComponent, SiSplitPartComponent, SplitUnit } from '@siemens/element-ng/split';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { timer } from 'rxjs';

@Component({
  selector: 'si-main-detail-container',
  imports: [
    NgTemplateOutlet,
    SiSplitComponent,
    SiSplitPartComponent,
    SiTranslatePipe,
    SiIconComponent
  ],
  templateUrl: './si-main-detail-container.component.html',
  styleUrl: './si-main-detail-container.component.scss',
  host: {
    class: 'si-layout-inner',
    '[class.animate]': 'animate()',
    '[style.opacity]': 'opacity()'
  }
})
export class SiMainDetailContainerComponent implements OnInit, OnChanges {
  protected readonly icons = addIcons({ elementBack });

  private readonly animationDuration = 500;
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly resizeObserver = inject(ResizeObserverService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly splitComponent = viewChild('splitComponent', { read: ElementRef });
  private readonly mainSplitPart = viewChild('mainSplitPart', { read: SiSplitPartComponent });

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
  readonly heading = input<TranslatableString>('');

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
  readonly detailsHeading = input<TranslatableString>('');

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
   * t(() => $localize`:@@SI_MAIN_DETAIL_CONTAINER.BACK:Back`)
   * ```
   */
  readonly detailsBackButtonText = input(t(() => $localize`:@@SI_MAIN_DETAIL_CONTAINER.BACK:Back`));

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
   * Unit used for the main split part when {@link resizableParts} is enabled.
   *
   * @defaultValue 'px'
   */
  readonly mainUnit = input<SplitUnit>('px');

  /**
   * The size of the main container. When {@link resizableParts} is enabled,
   * the value is interpreted using {@link mainUnit} and updates as the splitter is moved.
   * With `mainUnit="fr"`, the value is treated as a percentage-like fractional weight.
   * In the static layout, numeric values represent a percentage.
   *
   * @defaultValue 'default', which uses {@link minMainSize} for `px` and `32` for `fr`.
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
    if (mainContainerWidth !== 'default') {
      return mainContainerWidth;
    }

    if (!this.resizableParts()) {
      return 50;
    }

    return this.mainUnit() === 'px' ? this.minMainSize() : 32;
  });

  protected splitSizes: [number, number] = this.getSplitSizes();
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

  protected readonly animate = signal(false);

  protected readonly opacity = signal('0');

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.detailsActive) {
      this.updateDetailsFocusable();
      this.doAnimation(changes.detailsActive.currentValue);
    }
    if (
      changes.mainContainerWidth ||
      changes.resizableParts ||
      changes.mainUnit ||
      changes.minMainSize ||
      changes.minDetailSize
    ) {
      this.splitSizes = this.getSplitSizes();
      this.maxMainSize = this.getMaxSize(0);
      this.maxDetailSize = this.getMaxSize(1);
    }
  }

  ngOnInit(): void {
    this.resizeObserver
      .observe(this.elementRef.nativeElement, 100, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dimensions => this.determineLayout(dimensions));
  }

  protected onSplitSizesChange(sizes: number[]): void {
    if (this.mainUnit() === 'px') {
      this.mainContainerWidth.set(this.getMainSizePx(sizes[0]));
    } else {
      this.mainContainerWidth.set(sizes[0]);
    }
  }

  protected detailsBackClicked(): void {
    this.detailsActive.set(false);
    this.doAnimation(false);
  }

  /**
   * Get the max size to limit in the static flex layout (if less than 50%), otherwise not set
   */
  private getMaxSize(part: 0 | 1): string {
    const mainContainerWidth = this.mainContainerWidth();
    if (
      this.resizableParts() ||
      mainContainerWidth === 'default' ||
      !this.hasLargeSize ||
      mainContainerWidth < 0 ||
      mainContainerWidth > 100
    ) {
      return '';
    }

    const size = part === 0 ? mainContainerWidth : 100 - mainContainerWidth;
    return size > 50 ? '' : size + '%';
  }

  private getSplitSizes(): [number, number] {
    const mainSize = this.actualMainContainerWidth();
    if (!this.resizableParts()) {
      return mainSize >= 0 && mainSize <= 100 ? [mainSize, 100 - mainSize] : [50, 50];
    }

    if (this.mainUnit() === 'fr') {
      return mainSize >= 0 && mainSize <= 100 ? [mainSize, 100 - mainSize] : [32, 68];
    }

    return [mainSize, 1];
  }

  private getMainSizePx(fallbackPercentage: number): number {
    const mainPartSize = this.mainSplitPart()?.expandedSize();
    if (mainPartSize !== undefined) {
      return Math.round(mainPartSize);
    }

    const splitWidth = this.splitComponent()?.nativeElement.getBoundingClientRect().width;
    return splitWidth ? Math.round((splitWidth * fallbackPercentage) / 100) : this.minMainSize();
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
    if (this.opacity() === '0') {
      this.opacity.set('');
    }
  }

  private doAnimation(detailsActive: boolean): void {
    this.animate.set(true);
    timer(this.animationDuration)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.animate.set(false));
    this.detailsActive.set(detailsActive);
  }

  private updateDetailsFocusable(): void {
    this.preventFocusDetails = !this.hasLargeSize && !this.detailsActive();
  }
}
