/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkPortalOutlet, Portal, PortalModule } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BOOTSTRAP_BREAKPOINTS,
  Breakpoints,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
import { t } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { SiSidePanelService } from './si-side-panel.service';
import { SidePanelMode, SidePanelSize } from './side-panel.model';

@Component({
  selector: 'si-side-panel',
  imports: [PortalModule],
  templateUrl: './si-side-panel.component.html',
  styleUrl: './si-side-panel.component.scss',
  host: {
    class: 'si-layout-inner',
    '[class.enable-mobile]': 'enableMobile()',
    '[class.rpanel-size--regular]': 'this.size() === "regular"',
    '[class.rpanel-size--wide]': 'this.size() === "wide"',
    '[class.rpanel-size--extended]': 'this.size() === "extended"',
    '[class.rpanel-mode--over]': 'isOverMode()',
    '[class.rpanel-mode--scroll]': 'isScrollMode()',
    '[class.rpanel-collapsed]': 'isCollapsed()',
    '[class.ready]': 'ready()',
    '[class.collapsible]': 'collapsible() && !this.showTempContent()',
    '[class.collapsible-temp]': 'collapsible() && this.showTempContent()',
    '[class.rpanel-hidden]': 'isHidden()',
    '[class.rpanel-fullscreen-overlay]': 'isFullscreenOverlay()',
    '[class.rpanel-resize-xs]': 'isXs()',
    '[class.rpanel-resize-sm]': 'isSm()',
    '[class.rpanel-resize-md]': 'isMd()',
    '[class.rpanel-resize-lg]': 'isLg()',
    '[class.rpanel-resize-xl]': 'isXl()',
    '[class.rpanel-resize-xxl]': 'isXxl()',
    '[class.rpanel-resize-xxxl]': 'isXxxl()'
  },
  animations: [
    trigger('backdrop', [
      state('show', style({ 'opacity': '1' })),
      state('hide', style({ 'opacity': '0' })),
      transition('* <=> *', [animate('0.15s linear')])
    ])
  ]
})
export class SiSidePanelComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Custom breakpoint for ultra-wide screens (≥1920px)
   */
  private static readonly xxxlMinimum = 1920;

  /**
   * @defaultValue false
   */
  readonly collapsible = input(false, { transform: booleanAttribute });

  /**
   * Default state of navigation
   */
  readonly collapsed = model<boolean>();

  /**
   * Mode of side panel
   * (ignored below a certain width)
   *
   * @defaultValue 'over'
   */
  readonly mode = input<SidePanelMode>('over');

  /**
   * Size of side-panel
   *
   * @defaultValue 'regular'
   */
  readonly size = input<SidePanelSize>('regular');

  /**
   * Toggle icon aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`)
   * ```
   */
  readonly toggleItemLabel = input(t(() => $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`));

  /**
   * Specifies custom breakpoints to automatically switch mode.
   * The `smMinimum` specifies the breakpoint for the mobile view.
   * The `lgMinimum` specifies the breakpoint to allow scroll mode
   * (below automatically uses over mode).
   * The `xlMinimum` specifies the breakpoint to allow scroll mode
   * with wide size (below automatically uses over mode).
   */
  readonly breakpoints = input<Breakpoints>();

  /**
   * Enable mobile drawer for small screen sizes. Should not be used in conjunction with the vertical navbar.
   *
   * @defaultValue false
   */
  readonly enableMobile = input(false, { transform: booleanAttribute });

  /**
   * Whether to disable backdrop when side panel is open in over mode.
   * When false (default), the backdrop prevents interaction with background content while preserving visual context.
   *
   * @defaultValue false
   */
  readonly disableBackdrop = input(false, { transform: booleanAttribute });

  /**
   * Emits when the panel is closed
   */
  readonly closed = output();

  /**
   * Emits whenever the content is resized due to opening and closing or parent resize.
   */
  readonly contentResize = output<ElementDimensions>();

  protected readonly isScrollMode = computed(() => this.mode() === 'scroll');
  protected readonly isOverMode = computed(() => {
    if (this.mode() === 'over') {
      return true;
    }

    if (this.mode() === 'scroll') {
      if (this.isXs() || this.isSm() || this.isMd()) {
        return true;
      }
      if (this.isLg() && (this.size() === 'wide' || this.size() === 'extended')) {
        return true;
      }
    }

    return false;
  });
  protected readonly showBackdrop = computed(
    () => !this.disableBackdrop() && this.isOverMode() && !this.isCollapsed()
  );
  protected readonly isXs = signal(false);
  protected readonly isSm = signal(false);
  protected readonly isMd = signal(true);
  protected readonly isLg = signal(false);
  protected readonly isXl = signal(false);
  protected readonly isXxl = signal(false);
  protected readonly isXxxl = signal(false);
  protected readonly isCollapsed = signal(false);
  protected readonly ready = signal(false);
  protected readonly isHidden = signal(false);
  protected readonly isFullscreenOverlay = signal(false);
  protected readonly showTempContent = signal(false);

  private readonly panelElement = viewChild.required<ElementRef>('sidePanel');
  private readonly contentElement = viewChild.required<ElementRef>('content');
  private readonly portalOutlet = viewChild.required<CdkPortalOutlet, CdkPortalOutlet>(
    'portalOutlet',
    {
      read: CdkPortalOutlet
    }
  );
  private readonly tmpPortalOutlet = viewChild.required<CdkPortalOutlet, CdkPortalOutlet>(
    'tmpPortalOutlet',
    {
      read: CdkPortalOutlet
    }
  );

  /**
   * The $rpanel-transition-duration in the style is 0.5 seconds.
   * Sending the resize event after resize need to wait until resize is done.
   */
  private readonly resizeEventDelay = 500;
  private resizeEvent = new Subject<void>();
  private openingOrClosing = false;
  private previousContentDimensions: ElementDimensions = { width: 0, height: 0 };
  private isCollapsedInternal = false; // same as the other one, except w/o timeout for animation
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly element = inject(ElementRef);
  private readonly resizeObserver = inject(ResizeObserverService);
  private readonly service = inject(SiSidePanelService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.service.isFullscreen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fullscreen => {
      this.isFullscreenOverlay.set(fullscreen);
    });

    if (this.isBrowser) {
      this.resizeEvent
        .asObservable()
        .pipe(takeUntilDestroyed(), debounceTime(this.resizeEventDelay))
        .subscribe(() => {
          this.openingOrClosing = false;
          this.emitResizeOutputs();
          this.service.setFullscreen(false);
          if (this.isCollapsedInternal && !this.collapsible()) {
            this.isHidden.set(true);
          }
        });
    }

    effect(() => {
      if (this.showBackdrop()) {
        this.service.requestBodyScrollLock();
      } else {
        this.service.releaseBodyScrollLock();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.collapsed) {
      if (this.collapsed()) {
        this.service.close();
      } else {
        this.service.open();
      }
    }

    if (changes.enableMobile) {
      this.service.enableMobile.set(this.enableMobile());
    }

    if (changes.collapsible) {
      this.service.collapsible.set(this.collapsible());
    }
  }

  ngOnInit(): void {
    // handle initial state to avoid flicker
    const collapsed = this.collapsed() ?? !this.service.isOpen();
    this.isCollapsedInternal = collapsed;
    this.isHidden.set(collapsed);
    this.isCollapsed.set(collapsed);
    this.service.collapsible.set(this.collapsible());

    this.resizeObserver
      .observe(this.element.nativeElement, 100, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dim => {
        this.setBreakpoints(dim.width, dim.height);
        if (!this.ready()) {
          // delay because the initial sizing needs to settle
          setTimeout(() => {
            this.ready.set(true);
          }, 100);
        }
        if (!this.openingOrClosing) {
          this.emitResizeOutputs();
        }
      });

    this.service.content$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(portal => this.attachContent(portal));

    this.service.tempContent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(portal => this.attachTempContent(portal));

    this.service.isOpen$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isOpen => this.openClose(isOpen));
  }

  ngOnDestroy(): void {
    this.portalOutlet().detach();
    this.service.releaseBodyScrollLock();
  }
  /**
   * Toggle whether the side panel is expanded or not.
   */
  toggleSidePanel(): void {
    if (this.collapsible()) {
      this.service.toggle();
    } else {
      this.service.close();
    }
  }

  private emitResizeOutputs(): void {
    const contentDimensions = this.getContentDimensions();
    if (
      contentDimensions.width !== this.previousContentDimensions.width ||
      contentDimensions.height !== this.previousContentDimensions.height
    ) {
      this.previousContentDimensions = contentDimensions;
      this.contentResize.emit(contentDimensions);
    }
  }

  private getContentDimensions(): ElementDimensions {
    if (!this.isCollapsedInternal && this.isXs()) {
      return { width: 0, height: 0 };
    }
    const rect = this.contentElement().nativeElement.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  private setBreakpoints(width: number, height: number): void {
    if (!width && !height) {
      // element is not visible, no point in changing anything
      return;
    }
    const breakpoints = this.breakpoints() ?? BOOTSTRAP_BREAKPOINTS;

    this.isXs.set(width < breakpoints.smMinimum);
    this.isSm.set(width >= breakpoints.smMinimum && width < breakpoints.mdMinimum);
    this.isMd.set(width >= breakpoints.mdMinimum && width < breakpoints.lgMinimum);
    this.isLg.set(width >= breakpoints.lgMinimum && width < breakpoints.xlMinimum);
    this.isXl.set(width >= breakpoints.xlMinimum && width < breakpoints.xxlMinimum);
    this.isXxl.set(width >= breakpoints.xxlMinimum && width < SiSidePanelComponent.xxxlMinimum);
    this.isXxxl.set(width >= SiSidePanelComponent.xxxlMinimum);
  }

  private sendResize(): void {
    if (this.isScrollMode() || this.element.nativeElement.style.paddingRight !== '0') {
      this.openingOrClosing = true;
      this.resizeEvent.next();
    }
  }

  private attachContent(portal?: Portal<any>): void {
    const portalOutlet = this.portalOutlet();
    portalOutlet.detach();
    if (portal) {
      portalOutlet.attach(portal);
    }
    this.cdRef.markForCheck();
  }

  private attachTempContent(portal: Portal<any> | undefined): void {
    const tmpPortalOutlet = this.tmpPortalOutlet();
    tmpPortalOutlet.detach();
    if (portal) {
      tmpPortalOutlet.attach(portal);
      this.showTempContent.set(true);
      this.openClose(true, true);
    } else if (this.showTempContent()) {
      this.showTempContent.set(false);
      this.openClose(this.service.isOpen(), true);
    }
  }

  private openClose(open: boolean, regainFocus = false): void {
    if (open !== this.isCollapsedInternal) {
      this.moveFocusInside(open && regainFocus);
      return;
    }
    this.isCollapsedInternal = !open;
    if (open) {
      this.isHidden.set(false);
    }
    setTimeout(() => this.doOpenClose(open));
  }

  private doOpenClose(open: boolean): void {
    this.moveFocusInside(open);
    this.isCollapsed.set(!open);
    this.collapsed.set(this.isCollapsed());
    if (this.isCollapsedInternal) {
      this.closed.emit();
    }
    this.sendResize();
  }

  private moveFocusInside(open: boolean): void {
    if (
      open &&
      !this.document.activeElement?.parentElement?.classList.contains(
        'side-panel-collapse-toggle'
      ) &&
      !this.document.activeElement?.classList.contains('side-panel-collapse-toggle')
    ) {
      // moves the keyboard focus inside the panel so that the next tab is somewhere useful
      this.panelElement().nativeElement.focus();
      queueMicrotask(() => this.panelElement().nativeElement.blur());
    }
  }
}
