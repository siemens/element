/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkPortalOutlet, DomPortal, PortalModule } from '@angular/cdk/portal';
import { ViewportScroller } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  viewChild,
  DOCUMENT
} from '@angular/core';
import { ScrollbarHelper } from '@siemens/element-ng/common';
import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SiDashboardCardComponent } from './si-dashboard-card.component';
import { SiDashboardService } from './si-dashboard.service';

const FIX_SCROLL_PADDING_RESIZE_OBSERVER_THROTTLE = 10;

@Component({
  selector: 'si-dashboard',
  imports: [PortalModule, SiTranslateModule],
  templateUrl: './si-dashboard.component.html',
  styleUrl: './si-dashboard.component.scss',
  providers: [SiDashboardService],
  host: { class: 'si-layout-fixed-height' }
})
export class SiDashboardComponent implements OnChanges, OnDestroy, AfterViewInit {
  /**
   * Heading for the dashboard page.
   */
  readonly heading = input<string>();

  /**
   * Opt-in to enable expand interaction for all cards.
   *
   * @defaultValue false
   */
  readonly enableExpandInteractions = input(false, { transform: booleanAttribute });

  /**
   * Option to turn off the sticky behavior of the heading and menu bar.
   *
   * @defaultValue true
   */
  readonly sticky = input(true, { transform: booleanAttribute });

  /**
   * Option to hide the menu bar.
   *
   * @defaultValue false
   */
  readonly hideMenubar = input(false, { transform: booleanAttribute });

  /**
   * Is `true` if a card is expanded.
   * @defaultref {@link _isExpanded}
   */
  get isExpanded(): boolean {
    return this._isExpanded;
  }

  protected dashboardFrameEndPadding: number | null = null;
  protected readonly hideMenubarComputed = computed(
    () => this.hideMenubar() || this.hideMenubarInternal()
  );

  private _isExpanded = false;
  private unsubscribe = new Subject<void>();
  private scrollPosition: [number, number] = [0, 0];

  private cards: SiDashboardCardComponent[] = [];
  private readonly expandedPortalOutlet = viewChild.required('expandedPortalOutlet', {
    read: CdkPortalOutlet
  });
  private readonly dashboardFrame = viewChild.required<ElementRef<HTMLElement>>('dashboardFrame');
  private readonly dashboard = viewChild.required<ElementRef<HTMLElement>>('dashboard');

  private dashboardFrameDimensions?: ElementDimensions;
  private dashboardDimensions?: ElementDimensions;

  private scroller = inject(ViewportScroller);
  private dashboardService = inject(SiDashboardService);
  private resizeObserver = inject(ResizeObserverService);
  private scrollbarHelper = inject(ScrollbarHelper);
  private cdRef = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);
  private readonly hideMenubarInternal = signal(false);

  constructor() {
    this.dashboardService.cards$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(cards => this.subscribeToCards(cards));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.enableExpandInteractions) {
      this.initCards();
    }
  }

  ngAfterViewInit(): void {
    this.resizeObserver
      .observe(this.dashboard().nativeElement, FIX_SCROLL_PADDING_RESIZE_OBSERVER_THROTTLE)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => this.setDashboardFrameEndPadding(this.dashboardFrameDimensions, x));
    this.resizeObserver
      .observe(this.dashboardFrame().nativeElement, FIX_SCROLL_PADDING_RESIZE_OBSERVER_THROTTLE)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(dims => this.setDashboardFrameEndPadding(dims, this.dashboardDimensions));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private subscribeToCards(cards: SiDashboardCardComponent[]): void {
    this.cards = cards;
    this.initCards();
  }

  private initCards(): void {
    for (const card of this.cards) {
      // We only enforce expand if the dashboard value is true, otherwise we would remove the individual
      // card settings.
      const enableExpandInteractions = this.enableExpandInteractions();
      if (enableExpandInteractions) {
        card.enableExpandInteractionInternal.set(enableExpandInteractions);
      }

      card.expandChange.subscribe((expand: boolean) => {
        if (expand) {
          this.expand(card);
        } else {
          this.restoreDashboard();
        }
        this.cdRef.markForCheck();
      });
    }
  }

  /**
   * Expands the provided card to full size in the dashboard.
   * @param card - The card to be expanded.
   */
  public expand(card: SiDashboardCardComponent): void {
    if (this.isExpanded) {
      this.restoreDashboard();
    }
    if (this.sticky()) {
      this.scrollPosition = [
        this.dashboardFrame().nativeElement.scrollLeft,
        this.dashboardFrame().nativeElement.scrollTop
      ];
    } else {
      this.scrollPosition = this.scroller.getScrollPosition();
    }

    // Make sure card.expand() is called first and prevent recursions.
    if (!card.isExpanded()) {
      card.expand();
    } else {
      if (!card.showMenubar()) {
        this.hideMenubarInternal.set(true);
      }
      this._isExpanded = true;
      this.expandedPortalOutlet().detach();
      this.expandedPortalOutlet().attach(new DomPortal(card.element.nativeElement));
    }
  }

  /**
   * Restores the expanded card to it's previous position.
   */
  public restore(): void {
    // Restore all cards
    for (const card of this.cards) {
      if (card.isExpanded()) {
        card.restore();
      }
    }
    // Restore the dashboard and scroll to previous position
    this.restoreDashboard();
    // Subscribe to cards events again
    this.initCards();
    this.cdRef.markForCheck();
  }

  /**
   * Restored the UI state of the dashboard. This method is only part
   * of restoring a card and needs to be invoked after the card.restore()
   * method. In general this is achieved by listening to card events.
   */
  private restoreDashboard(): void {
    this.expandedPortalOutlet().detach();
    this.hideMenubarInternal.set(false);
    this.toggleCardsHide(false);
    const scrollBehavior = this.document.documentElement.style.scrollBehavior;
    this.document.documentElement.style.scrollBehavior = 'auto';
    setTimeout(() => {
      if (this.sticky()) {
        this.dashboardFrame().nativeElement.scrollTo({
          left: this.scrollPosition[0],
          top: this.scrollPosition[1],
          behavior: 'auto'
        });
      } else {
        this.scroller.scrollToPosition(this.scrollPosition);
        this.document.documentElement.style.scrollBehavior = scrollBehavior;
      }
      this.cdRef.markForCheck();
    });
    this._isExpanded = false;
  }

  private toggleCardsHide(expand: boolean): void {
    for (const card of this.cards) {
      card.hide = !card.isExpanded() && expand;
    }
  }

  private setDashboardFrameEndPadding(
    dashboardFrameDimensions?: ElementDimensions,
    dashboardDimensions?: ElementDimensions
  ): void {
    if (!this.sticky()) {
      return;
    }

    if (
      this.dashboardDimensions === dashboardDimensions &&
      this.dashboardFrameDimensions === dashboardFrameDimensions
    ) {
      return;
    }

    this.dashboardDimensions = dashboardDimensions;
    this.dashboardFrameDimensions = dashboardFrameDimensions;

    let padding = this.document.body.offsetWidth >= BOOTSTRAP_BREAKPOINTS.mdMinimum ? 32 : 16;
    if (
      dashboardDimensions &&
      dashboardFrameDimensions &&
      dashboardDimensions.height > dashboardFrameDimensions.height
    ) {
      padding = padding - this.scrollbarHelper.width;
    }
    this.dashboardFrameEndPadding = padding;
    this.cdRef.markForCheck();
  }
}
