/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkPortalOutlet, Portal, PortalModule } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
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
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  SimpleChanges,
  viewChild,
  DOCUMENT
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BOOTSTRAP_BREAKPOINTS,
  Breakpoints,
  ElementDimensions,
  ResizeObserverService
} from '@siemens/element-ng/resize-observer';
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
    '[class.rpanel-mode--over]': 'this.mode() === "over"',
    '[class.rpanel-mode--scroll]': 'isScrollMode()',
    '[class.rpanel-collapsed]': 'isCollapsed()',
    '[class.ready]': 'ready()',
    '[class.collapsible]': 'collapsible() && !this.showTempContent()',
    '[class.collapsible-temp]': 'collapsible() && this.showTempContent()',
    '[class.rpanel-hidden]': 'isHidden()',
    '[class.rpanel-resize-xs]': 'isXs()',
    '[class.rpanel-resize-sm]': 'isSm()',
    '[class.rpanel-resize-md]': 'isMd()',
    '[class.rpanel-resize-lg]': 'isLg()',
    '[class.rpanel-resize-xl]': 'isXl()'
  }
})
export class SiSidePanelComponent implements OnInit, OnDestroy, OnChanges {
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
   * $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`
   * ```
   */
  readonly toggleItemLabel = input($localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`);

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
   * Emits when the panel is closed
   */
  readonly closed = output();

  /**
   * Emits whenever the content is resized due to opening and closing or parent resize.
   */
  readonly contentResize = output<ElementDimensions>();

  protected readonly isScrollMode = computed(() => this.mode() === 'scroll');

  protected readonly isXs = signal(false);
  protected readonly isSm = signal(false);
  protected readonly isMd = signal(true);
  protected readonly isLg = signal(false);
  protected readonly isXl = signal(false);
  protected readonly isCollapsed = signal(false);
  protected readonly ready = signal(false);
  protected readonly isHidden = signal(false);
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
    if (this.isBrowser) {
      this.resizeEvent
        .asObservable()
        .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(this.resizeEventDelay))
        .subscribe(() => {
          this.openingOrClosing = false;
          this.emitResizeOutputs();
          if (this.isCollapsedInternal && !this.collapsible()) {
            this.isHidden.set(true);
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.collapsed) {
      if (this.collapsed()) {
        this.service.close();
      } else {
        this.service.open();
      }
    } else if (changes.enableMobile) {
      this.service.enableMobile.set(this.enableMobile());
    }
  }

  ngOnInit(): void {
    // handle initial state to avoid flicker
    const collapsed = this.collapsed() ?? !this.service.isOpen();
    this.isCollapsedInternal = collapsed;
    this.isHidden.set(collapsed);
    this.isCollapsed.set(collapsed);

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
      .subscribe(state => this.openClose(state));
  }

  ngOnDestroy(): void {
    this.portalOutlet().detach();
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
    this.isXl.set(width >= breakpoints.xlMinimum);
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
