/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  HostListener,
  inject,
  Injector,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { filter, skip, take, takeUntil } from 'rxjs/operators';

import { SI_HEADER_WITH_DROPDOWNS } from './si-header.model';

@Component({ template: '', host: { '[attr.aria-owns]': 'ariaOwns()' } })
class SiHeaderAnchorComponent {
  readonly ariaOwns = input<string>();
}

/**
 * Trigger to open dropdowns in a navbar.
 * A dropdown will always be attached to the view, even if not visible.
 *
 * If a dropdown is opened in desktop mode, it will be reattached to an overlay while being opened.
 */
@Directive({
  selector: '[siHeaderDropdownTriggerFor]',
  host: {
    class: 'dropdown-toggle'
  },
  exportAs: 'siHeaderDropdownTrigger'
})
export class SiHeaderDropdownTriggerDirective implements OnChanges, OnInit, OnDestroy {
  private static idCounter = 0;

  /** Template that be rendered inside the dropdown. */
  readonly dropdown = input.required<TemplateRef<unknown>>({ alias: 'siHeaderDropdownTriggerFor' });
  /** Data that should be passed as template context to the dropdown. */
  readonly dropdownData = input<unknown>();
  /** Emits whenever a dropdown is opened or closed. */
  readonly openChange = output<boolean>();

  private readonly dropdownClose = new Subject<void>();

  /** Child triggers will set themselves here if they are open. */
  private openSubmenu?: SiHeaderDropdownTriggerDirective;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly parent = inject(SiHeaderDropdownTriggerDirective, {
    optional: true,
    skipSelf: true
  });
  /** @internal */
  readonly navbar = inject(SI_HEADER_WITH_DROPDOWNS, { optional: true });

  // we need to create a new injector, so that the parent can be injected properly
  private readonly injector = Injector.create({ parent: inject(Injector), providers: [] });
  private viewRef?: EmbeddedViewRef<unknown>;
  private portal?: TemplatePortal<unknown>;
  private overlayRef?: OverlayRef;

  /** @internal */
  readonly level: number = this.parent ? this.parent.level + 1 : 1;

  // used to prevent immediate re-creation of the overlay if this trigger was clicked while overlay is open
  private destroying = false;

  /** @internal */
  @HostBinding('id') readonly id =
    `si-navbar-dropdown-trigger-${SiHeaderDropdownTriggerDirective.idCounter++}`;

  @HostBinding('class.show') @HostBinding('attr.aria-expanded') private _isOpen = false;

  /** @internal */
  @HostBinding('attr.aria-controls') readonly ariaControls =
    `si-navbar-dropdown-${SiHeaderDropdownTriggerDirective.idCounter}`;

  private headerAnchorComponentRef?: ComponentRef<SiHeaderAnchorComponent>;

  /** Whether the dropdown is open. */
  get isOpen(): boolean {
    return this._isOpen;
  }

  /** @internal */
  get isOverlay(): boolean {
    return !!this.overlayRef;
  }

  ngOnChanges(): void {
    if (this.portal) {
      this.portal.templateRef = this.dropdown();
      this.portal.context = this.dropdownData();
    }
  }

  ngOnInit(): void {
    // Always attach the dropdown, so that it can be used with routerLinkActive
    this.attachDropdownInline();
  }

  ngOnDestroy(): void {
    this.close();
    this.dropdownClose.complete();
  }

  /** Opens the dropdown. */
  open(): void {
    if (this.destroying || this._isOpen) {
      return;
    }

    (this.navbar?.inlineDropdown ?? of(false)).pipe(take(1)).subscribe(inline => {
      this._isOpen = true;
      if (!inline) {
        this.attachDropdownOverlay();
      }
      this.navbar?.inlineDropdown
        ?.pipe(skip(1), takeUntil(this.dropdownClose))
        .subscribe(() => this.close());
    });

    if (this.parent) {
      this.parent.openSubmenu = this;
    }

    if (this.navbar?.dropdownOpened) {
      this.navbar?.dropdownOpened(this);
    }
    this.openChange.emit(true);
  }

  /** Closes the dropdown. */
  close(options?: { all?: boolean }): void {
    if (!this._isOpen) {
      return;
    }

    if (this.openSubmenu) {
      this.openSubmenu.close();
    }

    this.dropdownClose.next();
    this._isOpen = false;
    if (this.overlayRef) {
      this.destroying = true;
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.viewRef?.destroy();
      this.portal = undefined;
      this.overlayRef = undefined;
      this.headerAnchorComponentRef?.destroy();
      // do not use queueMicrotask, it executed to early
      setTimeout(() => (this.destroying = false));
      this.attachDropdownInline();
    } else {
      this.viewRef?.markForCheck();
    }

    if (this.parent) {
      this.parent.openSubmenu = undefined;
    }

    if (options?.all && this.parent) {
      this.parent.close(options);
    } else {
      if (this.navbar?.dropdownClosed) {
        this.navbar?.dropdownClosed(this);
      }
      this.openChange.emit(false);
    }
  }

  @HostListener('click')
  protected click(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private attachDropdownInline(): void {
    this.viewRef = this.viewContainerRef.createEmbeddedView(this.dropdown(), this.dropdownData(), {
      injector: this.injector
    });
    this.viewRef.markForCheck();
  }

  private attachDropdownOverlay(): void {
    this.viewRef?.destroy();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions(
          this.navbar?.overlayPosition ??
            (this.level > 1
              ? [
                  {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top',
                    offsetX: 2
                  }
                ]
              : [
                  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                  {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top',
                    offsetX: -4
                  }
                ])
        )
    });
    this.portal = new TemplatePortal(
      this.dropdown(),
      this.viewContainerRef,
      this.dropdownData(),
      this.injector
    );
    this.viewRef = this.overlayRef.attach(this.portal);
    this.headerAnchorComponentRef = this.viewContainerRef.createComponent(SiHeaderAnchorComponent);
    this.headerAnchorComponentRef.setInput('ariaOwns', this.ariaControls);

    this.overlayRef
      .outsidePointerEvents()
      .pipe(
        filter(event => event.type === 'click'),
        filter(() => !this.openSubmenu),
        takeUntil(this.dropdownClose),
        take(1)
      )
      .subscribe(() => this.close());
  }
}
