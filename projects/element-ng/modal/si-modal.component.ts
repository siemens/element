/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
  Type,
  untracked,
  viewChild,
  ViewContainerRef,
  DOCUMENT,
  NgZone
} from '@angular/core';

import { ModalRef } from './modalref';

@Component({
  selector: 'si-modal',
  imports: [A11yModule],
  templateUrl: './si-modal.component.html',
  host: {
    class: 'modal d-block',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
    '[class.dialog-leave]': '!show()',
    '(transitionend)': 'onLeaveEnd($event)',
    '[style.--element-animations-enabled]': 'modalRef.data.animated === false ? 0 : null',
    '(mousedown)': 'clickStarted($event)',
    '(mouseup)': 'onClickStop($event)',
    '(window:keydown.esc)': 'onEsc($event)'
  }
})
export class SiModalComponent implements OnInit, AfterViewInit {
  readonly content = input.required<TemplateRef<unknown> | Type<unknown>>();
  componentRef?: ComponentRef<unknown>;

  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly modalRef = inject(ModalRef<unknown, unknown>);

  protected readonly dialogClass = this.modalRef.dialogClass ?? '';
  protected readonly titleId = this.modalRef.data?.ariaLabelledBy ?? '';
  protected readonly show = signal(true);

  private readonly contentContainer = viewChild.required('contentContainer', {
    read: ViewContainerRef
  });

  private clickStartInDialog = false;
  private origBodyOverflow?: string;
  private backdropGhostClickPrevention = true;
  private detachFn?: () => void;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.restoreBodyOverflow());
    effect(() => {
      const content = this.content();
      const viewContainer = this.contentContainer();
      untracked(() => this.attachContent(content, viewContainer));
    });
  }

  ngOnInit(): void {
    if (this.modalRef.layer === 1) {
      // Lock only the background; overflowing content scrolls in the modal container.
      this.origBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }
    this.ngZone.runOutsideAngular(() =>
      setTimeout(() => (this.backdropGhostClickPrevention = false), 300)
    );
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.modalRef.shown.next(this.elementRef));
  }

  private attachContent(
    content: TemplateRef<unknown> | Type<unknown>,
    viewContainer: ViewContainerRef
  ): void {
    viewContainer.clear();
    this.componentRef = undefined;
    if (content instanceof TemplateRef) {
      viewContainer.createEmbeddedView(content, {
        modalRef: this.modalRef,
        ...this.modalRef.data.inputValues
      });
      return;
    }

    this.componentRef = viewContainer.createComponent(content, {
      environmentInjector: this.modalRef.data.environmentInjector,
      bindings: this.modalRef.data.bindings
    });
    for (const [key, value] of Object.entries(this.modalRef.data.inputValues ?? {})) {
      this.componentRef.setInput(key, value);
    }
  }

  /** @internal */
  hideDialog(param?: unknown): void {
    if (!this.show()) {
      return;
    }

    // Capture `detach()` in modal ref to no-op so that the animation is unaffected if called
    this.detachFn = this.modalRef.detach;
    this.modalRef.detach = () => {};

    // Check transition duration before toggling the DOM changes to avoid issues with zero-duration transitions where transitionend won't fire
    const isAnimated =
      parseFloat(getComputedStyle(this.elementRef.nativeElement).transitionDuration) > 0;

    // Toggle the leave class on the host.
    this.show.set(false);
    this.restoreBodyOverflow();
    this.modalRef?.hidden.next(param);
    this.modalRef?.hidden.complete();
    this.modalRef?.message.complete();

    // For disabled animations or test environments, transitionend won't fire (0s duration)
    if (!isAnimated) {
      this.detachFn?.();
    }
  }

  private restoreBodyOverflow(): void {
    if (this.origBodyOverflow !== undefined) {
      this.document.body.style.overflow = this.origBodyOverflow;
      this.origBodyOverflow = undefined;
    }
  }

  protected onLeaveEnd(event: TransitionEvent): void {
    if (!this.show() && event.target === event.currentTarget) {
      this.detachFn?.();
    }
  }

  protected clickStarted(event: MouseEvent): void {
    this.clickStartInDialog = event.target !== this.elementRef.nativeElement;
  }

  protected onClickStop(event: MouseEvent): void {
    const clickedInBackdrop =
      event.target === this.elementRef.nativeElement && !this.clickStartInDialog;
    if (this.modalRef?.ignoreBackdropClick || !clickedInBackdrop) {
      this.clickStartInDialog = false;
      return;
    }

    if (!this.backdropGhostClickPrevention) {
      // Called when backdrop close is allowed and user clicks on the backdrop
      this.modalRef.messageOrHide(this.modalRef.closeValue);
    } else {
      // When in ghost click prevention mode, avoid text selection
      this.document.getSelection()?.removeAllRanges();
    }
  }

  protected onEsc(event: Event): void {
    if (this.modalRef?.data.keyboard && this.modalRef?.isCurrent()) {
      event.preventDefault();
      this.modalRef.messageOrHide(this.modalRef.closeValue);
    }
  }
}
