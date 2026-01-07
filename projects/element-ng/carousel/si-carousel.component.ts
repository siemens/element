/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { elementLeft2, elementRight2, elementPause, elementPlay } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { switchMap } from 'rxjs';

import { SiCarouselItemDirective } from './si-carousel-item.directive';

/**
 * Maximum number of pagination dots shown in the pager.
 */
const MAX_PAGES = 5;

/**
 * Time constant (in milliseconds) for the exponential-smoothing scroll animation. Smaller values
 * settle faster. The animation is retargetable, so rapid clicks keep adjusting the same animation
 * towards the latest slide instead of starting separate, queued scrolls.
 */
const SCROLL_SMOOTHING_TAU = 100;

/**
 * Assumed duration (in milliseconds) of the first animation frame, used before two timestamps are
 * available to measure a real delta. 16ms corresponds to one frame at ~60Hz, a safe default that
 * keeps the first easing step the same size as a normal frame.
 */
const FIRST_FRAME_DELTA = 16;

/**
 * Distance (in CSS pixels) below which the viewport is considered to have reached its target. Less
 * than a pixel is imperceptible, so the animation snaps to the target and stops instead of easing
 * across ever-smaller, invisible fractions of a pixel forever.
 */
const SCROLL_SETTLE_THRESHOLD = 0.5;

/**
 * Per-frame progress (in CSS pixels) below which the animation is treated as stalled. The browser
 * can cap `scrollLeft` a sub-pixel short of the computed target at the scroll boundary; without
 * this guard the loop would never reach the target and would spin forever. Kept below
 * {@link SCROLL_SETTLE_THRESHOLD} so it only triggers when real movement has effectively stopped.
 */
const SCROLL_STALL_THRESHOLD = 0.25;

/**
 * A carousel component for displaying slides with navigation controls and auto-play.
 *
 * Features horizontal scrolling with snap behavior, pagination dots, and ARIA accessibility.
 * Suitable for dashboards, image galleries, and content showcases.
 *
 * @example
 *
 * ```typescript
 * import { SiCarouselComponent, SiCarouselItemDirective } from '@siemens/element-ng/carousel';
 *
 * @Component({
 *   imports: [SiCarouselComponent, SiCarouselItemDirective],
 *   template: `
 *     <si-carousel>
 *       <div siCarouselItem><h2>Slide 1</h2></div>
 *       <div siCarouselItem><h2>Slide 2</h2></div>
 *       <div siCarouselItem><h2>Slide 3</h2></div>
 *     </si-carousel>
 *   `
 * })
 * export class MyComponent {}
 * ```
 */
@Component({
  selector: 'si-carousel',
  imports: [SiTranslatePipe, SiResizeObserverDirective, SiIconComponent],
  templateUrl: './si-carousel.component.html',
  styleUrl: './si-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'ariaRole()',
    '[attr.aria-roledescription]': 'translatedCarouselRoleDescription()',
    '[style.min-width.px]': 'pageControlContainerMinWidth()'
  }
})
export class SiCarouselComponent {
  /**
   * Controls whether pagination controls are shown.
   * When `true`, the carousel shows one slide per page and hides pagination controls.
   * @defaultValue false
   * */
  readonly hidePageControls = input(false, { transform: booleanAttribute });
  /**
   * Enables or configures auto-play for the carousel. When set to `true`, the carousel automatically
   * navigates to the next slide every 5000 milliseconds (5 seconds). Pass a positive number to set a
   * custom interval in milliseconds. Pass `false` to disable auto-play.
   * @defaultValue false
   * */
  readonly autoPlay = input<boolean | number>(false);
  /**
   * Aria role of the carousel element. Can be set to 'region' or 'group' depending on the desired accessibility semantics.
   * @defaultValue 'region'
   * */
  readonly ariaRole = input<'region' | 'group'>('region');

  /**
   * Aria label for the previous button, used for accessibility purposes.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.PREVIOUS:Previous slide`)
   * ```
   */
  readonly previousButtonAriaLabel = input(
    t(() => $localize`:@@SI_CAROUSEL.PREVIOUS:Previous slide`)
  );
  /**
   * Aria label for the next button, used for accessibility purposes.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.NEXT:Next slide`)
   * ```
   */
  readonly nextButtonAriaLabel = input(t(() => $localize`:@@SI_CAROUSEL.NEXT:Next slide`));

  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.SLIDE_PAGE:Slide {{page}} of {{total}}`)
   * ```
   */
  readonly slidePageAriaLabel = input(
    t(() => $localize`:@@SI_CAROUSEL.SLIDE_PAGE:Slide {{page}} of {{total}}`)
  );

  /**
   * Label for the play button when autoplay is paused.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.PLAY:Play`)
   * ```
   */
  readonly playButtonLabel = input(t(() => $localize`:@@SI_CAROUSEL.PLAY:Play`));

  /**
   * Label for the pause button when autoplay is active.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.PAUSE:Pause`)
   * ```
   */
  readonly pauseButtonLabel = input(t(() => $localize`:@@SI_CAROUSEL.PAUSE:Pause`));

  /**
   * Role description for the carousel container, used for accessibility purposes.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.ROLE_DESCRIPTION:carousel`)
   * ```
   */
  readonly carouselRoleDescription = input(
    t(() => $localize`:@@SI_CAROUSEL.ROLE_DESCRIPTION:carousel`)
  );
  /**
   * Role description for each slide, used for accessibility purposes.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CAROUSEL.SLIDE_ROLE_DESCRIPTION:Slide`)
   * ```
   */
  readonly slideRoleDescription = input(
    t(() => $localize`:@@SI_CAROUSEL.SLIDE_ROLE_DESCRIPTION:Slide`)
  );

  /** @internal */
  readonly translatedSlideRoleDescription = toSignal(
    toObservable(this.slideRoleDescription).pipe(
      switchMap(key => this.translateService.translateAsync(key))
    ),
    { initialValue: '' }
  );
  /** @internal */
  readonly currentActiveSlide = computed(() => {
    const currentPage = this.currentPage();
    if (currentPage !== null && this.items().length) {
      return this.items()[currentPage].elementRef;
    }
    return null;
  });

  protected readonly translatedCarouselRoleDescription = toSignal(
    toObservable(this.carouselRoleDescription).pipe(
      switchMap(key => this.translateService.translateAsync(key))
    ),
    { initialValue: '' }
  );
  protected readonly items = contentChildren(SiCarouselItemDirective);

  protected readonly currentPage = linkedSignal<number | null>(() =>
    this.items().length ? 0 : null
  );
  protected readonly isPaused = signal(false);
  protected readonly totalPages = computed(() => this.items().length);
  protected readonly edgeLeftIndex = signal(0);
  protected readonly edgeRightIndex = signal(MAX_PAGES - 1);
  protected readonly insufficientSpace = signal(false);
  protected readonly pageControlContainerMinWidth = signal(0);
  protected readonly icons = addIcons({ elementLeft2, elementRight2, elementPlay, elementPause });

  private readonly autoPlayDuration = computed(() => {
    const autoPlayValue = this.autoPlay();
    if (typeof autoPlayValue === 'boolean') {
      return autoPlayValue ? 5000 : 0;
    }
    return autoPlayValue > 0 ? autoPlayValue : 0;
  });
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private scrollObserver: IntersectionObserver | null = null;
  /** requestAnimationFrame id of the running scroll animation, or null when idle. */
  private animationFrameId: number | null = null;
  /** Scroll position (`scrollLeft`) the running animation is easing towards. */
  private animationTargetLeft = 0;
  /** Timestamp of the previous animation frame, used to make the easing frame-rate independent. */
  private lastFrameTime = 0;
  /** Whether any slide's CSS order has been changed from its natural (source-index) position. */
  private ordersModified = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly pageControl = viewChild<ElementRef<HTMLElement>>('pageControl');
  private readonly playPauseBtn = viewChild<ElementRef<HTMLElement>>('playPauseBtn');
  private readonly translateService = injectSiTranslateService();
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    effect(onCleanup => {
      this.scheduleAutoPlay();
      onCleanup(() => clearInterval(this.intervalId!));
    });

    effect(() => {
      // Reset to the first page if the current page becomes out of range due to items being added/removed.
      const currentPage = this.currentPage();
      if (currentPage !== null && currentPage >= this.totalPages()) {
        this.cancelAnimation();
        this.items().forEach((_, i) => this.setSlideOrder(i, i));
        this.ordersModified = false;
        this.goToPage(0);
      }
    });

    effect(() => {
      this.setupScrollObserver();
    });

    effect(() => {
      // Establish the canonical track order (each slide's CSS order equals its source index) so the
      // navigation maths stay consistent. Skipped while an order change is mid-flight, where the
      // orders are intentionally extended and normalized once the animation settles.
      const items = this.items();
      if (this.ordersModified) {
        return;
      }
      items.forEach((_, i) => this.setSlideOrder(i, i));
    });

    effect(() => {
      this.updateEdgeIndices();
    });

    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.scrollObserver?.disconnect();
    });
  }

  protected goToPage(page: number, forceScroll = true): void {
    this.currentPage.set(page);
    this.scheduleAutoPlay();
    if (forceScroll) {
      this.animateToSlide(page);
    }
  }

  protected next(): void {
    this.step(1);
  }

  protected previous(): void {
    this.step(-1);
  }

  /** Navigates directly to a specific slide, used by the pagination dots. */
  protected goToSlide(index: number): void {
    this.cancelAnimation();
    this.normalizeOrders();
    this.goToPage(index, true);
  }

  protected toggleAutoPlay(): void {
    this.isPaused.update(paused => !paused);
    if (this.isPaused()) {
      this.stopAutoPlay();
    } else {
      this.scheduleAutoPlay();
    }
  }

  protected onResize(size: { width: number; height: number }): void {
    const pageControl = this.pageControl();
    if (!pageControl) {
      return;
    }
    const pageControlWidth = pageControl.nativeElement.offsetWidth;
    if (this.autoPlay()) {
      const playPauseBtnWidth = this.playPauseBtn()?.nativeElement.offsetWidth ?? 0;
      const minWidth = pageControlWidth + playPauseBtnWidth;
      if (minWidth > size.width - playPauseBtnWidth) {
        this.insufficientSpace.set(true);
      } else {
        this.insufficientSpace.set(false);
      }
      this.pageControlContainerMinWidth.set(minWidth);
    } else {
      this.insufficientSpace.set(false);
      this.pageControlContainerMinWidth.set(pageControlWidth);
    }
  }

  /**
   * Navigates a single slide forward (`1`) or backward (`-1`). Rapid clicks are intentionally not
   * queued or throttled: each click advances {@link currentPage} immediately and retargets the
   * running scroll animation (see {@link animateTo}) towards the new slide, so the carousel keeps
   * gliding in the click direction without waiting for the previous scroll to finish.
   *
   * To keep the first/last wrap a continuous one-slide glide instead of a jump across the whole
   * track, the target slide's CSS order is placed exactly one slot away from the current slide in
   * the click direction (so it sits adjacent to it). The viewport scroll is compensated so this
   * reorder is invisible. Orders may extend while the user keeps clicking; they are silently
   * normalized once the animation settles (see {@link normalizeOrders}).
   */
  private step(direction: 1 | -1): void {
    const total = this.totalPages();
    if (total <= 1) {
      return;
    }
    const from = this.currentPage() ?? 0;
    const to = (from + direction + total) % total;

    // Ensure the target slide sits one slot away from the current slide in the click direction.
    // For a normal step it already does; for a first/last wrap it does not, so move it there.
    const desiredOrder = this.items()[from].order() + direction;
    if (this.items()[to].order() !== desiredOrder) {
      this.reorderSlide(to, desiredOrder, from);
    }

    this.currentPage.set(to);
    this.scheduleAutoPlay();
    this.animateToSlide(to);
  }

  /**
   * Changes a slide's CSS order while keeping the picture stable. Reordering shifts slides along
   * the flex track, so the scroll position is adjusted by the exact amount the anchor slide moved,
   * making the relocation invisible and letting any in-flight animation continue seamlessly.
   */
  private reorderSlide(index: number, order: number, anchorIndex: number): void {
    const viewport = this.viewport().nativeElement;
    const anchor = this.items()[anchorIndex].elementRef.nativeElement;
    const before = anchor.getBoundingClientRect().left;
    this.setSlideOrder(index, order);
    // Reading layout after the order change forces a synchronous reflow with the new positions.
    const after = anchor.getBoundingClientRect().left;
    viewport.scrollLeft += after - before;
    this.ordersModified = true;
  }

  /**
   * Sets the CSS order of a slide. The value is written to the DOM synchronously in addition to
   * the signal, so a subsequent reflow/scroll uses the new order immediately instead of waiting
   * for the asynchronous, signal-driven change detection update.
   */
  private setSlideOrder(index: number, order: number): void {
    const slide = this.items()[index];
    slide.order.set(order);
    slide.elementRef.nativeElement.style.order = `${order}`;
  }

  /**
   * Silently restores the canonical slide order (each slide's CSS order equals its source index).
   * Reordering shifts the track, so it anchors on the current slide and compensates the scroll
   * position to avoid any visible jump. Called once the scroll animation settles.
   */
  private normalizeOrders(): void {
    if (!this.ordersModified) {
      return;
    }
    const items = this.items();
    const viewport = this.viewport().nativeElement;
    const current = this.currentPage();
    const anchor = current !== null ? items[current]?.elementRef.nativeElement : undefined;
    const before = anchor?.getBoundingClientRect().left ?? 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].order() !== i) {
        this.setSlideOrder(i, i);
      }
    }
    if (anchor) {
      const after = anchor.getBoundingClientRect().left;
      viewport.scrollLeft += after - before;
    }
    this.ordersModified = false;
  }

  /** Animates the viewport so the given slide is horizontally centered. */
  private animateToSlide(index: number): void {
    const viewport = this.viewport().nativeElement;
    const slide = this.items()[index].elementRef.nativeElement;
    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const delta =
      slideRect.left + slideRect.width / 2 - (viewportRect.left + viewportRect.width / 2);
    this.animateTo(viewport.scrollLeft + delta);
  }

  /**
   * Eases `scrollLeft` towards `targetLeft` using a frame-rate independent exponential smoothing
   * loop. The target can be updated mid-flight (rapid clicks), so the same animation simply chases
   * the latest slide. Native scroll-snap and smooth scroll-behavior are disabled while animating so
   * they do not fight the manual scrolling, and the scroll observer is paused to avoid feedback.
   */
  private animateTo(targetLeft: number): void {
    this.animationTargetLeft = targetLeft;
    if (this.animationFrameId !== null) {
      return;
    }
    const viewport = this.viewport().nativeElement;
    this.scrollObserver?.disconnect();
    viewport.style.scrollSnapType = 'none';
    viewport.style.scrollBehavior = 'auto';
    this.lastFrameTime = 0;
    this.animationFrameId = requestAnimationFrame(time => this.animationFrame(time));
  }

  private animationFrame(now: number): void {
    const viewport = this.viewport().nativeElement;
    const dt = this.lastFrameTime ? now - this.lastFrameTime : FIRST_FRAME_DELTA;
    this.lastFrameTime = now;
    const current = viewport.scrollLeft;
    // Clamp the target to the scrollable range. A wrapped slide can be placed right at the track
    // edge, where the rect-derived target may exceed the maximum by a sub-pixel; without clamping
    // the loop would never reach it and never settle (leaving the order normalization undone).
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const target = Math.max(0, Math.min(this.animationTargetLeft, maxScrollLeft));
    const diff = target - current;
    if (Math.abs(diff) < SCROLL_SETTLE_THRESHOLD) {
      viewport.scrollLeft = target;
      this.animationFrameId = null;
      this.endAnimation();
      return;
    }
    viewport.scrollLeft = current + diff * (1 - Math.exp(-dt / SCROLL_SMOOTHING_TAU));
    // The browser can cap `scrollLeft` a sub-pixel short of the computed target (rounding at the
    // scroll boundary). If a frame makes no real progress, treat the animation as settled instead
    // of spinning forever.
    if (Math.abs(viewport.scrollLeft - current) < SCROLL_STALL_THRESHOLD) {
      this.animationFrameId = null;
      this.endAnimation();
      return;
    }
    this.animationFrameId = requestAnimationFrame(time => this.animationFrame(time));
  }

  /** Finalizes the animation: normalizes orders, restores native scrolling and the observer. */
  private endAnimation(): void {
    this.normalizeOrders();
    const viewport = this.viewport().nativeElement;
    viewport.style.scrollSnapType = '';
    viewport.style.scrollBehavior = '';
    this.cdRef.markForCheck();
    this.setupScrollObserver();
  }

  /** Stops the running scroll animation and restores native scrolling, without normalizing. */
  private cancelAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const viewport = this.viewport().nativeElement;
    viewport.style.scrollSnapType = '';
    viewport.style.scrollBehavior = '';
    this.cdRef.markForCheck();
  }

  private scheduleAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (!this.autoPlayDuration() || this.items().length === 0 || this.isPaused()) {
      return;
    }
    this.intervalId = setInterval(() => this.next(), this.autoPlayDuration());
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private setupScrollObserver(): void {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    const items = this.items();
    if (items.length === 0) {
      return;
    }

    const viewport = this.viewport().nativeElement;
    this.scrollObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            const itemIndex = items.findIndex(item => item.elementRef.nativeElement === target);
            if (itemIndex !== -1) {
              this.goToPage(itemIndex, false);
            }
          }
        });
      },
      { root: viewport, threshold: 0.6, rootMargin: '0px' }
    );

    for (const item of items) {
      this.scrollObserver.observe(item.elementRef.nativeElement);
    }
  }

  private updateEdgeIndices(): void {
    const total = this.totalPages();
    const current = this.currentPage();
    if (current === null) {
      return;
    }
    if (total <= MAX_PAGES) {
      this.edgeLeftIndex.set(0);
      this.edgeRightIndex.set(total - 1);
      return;
    }

    if (current < this.edgeLeftIndex()) {
      this.edgeLeftIndex.set(current);
      this.edgeRightIndex.set(current + MAX_PAGES - 1);
    }

    if (current > this.edgeRightIndex()) {
      this.edgeRightIndex.set(current);
      this.edgeLeftIndex.set(current - MAX_PAGES + 1);
    }
  }
}
