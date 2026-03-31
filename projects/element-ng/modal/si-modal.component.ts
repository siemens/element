/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  DOCUMENT
} from '@angular/core';

import { ModalRef } from './modalref';

@Component({
  selector: 'si-modal',
  imports: [A11yModule],
  templateUrl: './si-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--element-animations-enabled]': 'modalRef.data.animated === false ? 0 : null',
    '(mousedown)': 'clickStarted($event)',
    '(mouseup)': 'onClickStop($event)',
    '(window:keydown.esc)': 'onEsc($event)'
  }
})
export class SiModalComponent implements OnInit, AfterViewInit {
  protected readonly modalRef = inject(ModalRef<unknown, any>);

  protected readonly dialogClass = this.modalRef.dialogClass ?? '';
  protected readonly titleId = this.modalRef.data?.ariaLabelledBy ?? '';
  protected readonly show = signal(true);
  protected readonly showBackdropVisible = signal(false);

  private clickStartInDialog = false;
  private origBodyOverflow?: string;
  private backdropGhostClickPrevention = true;
  private detachFn?: () => void;
  private readonly document = inject(DOCUMENT);

  private readonly modalContainerRef = viewChild.required<ElementRef>('modalContainer');

  ngOnInit(): void {
    setTimeout(() => (this.backdropGhostClickPrevention = false), 300);
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.modalRef?.shown.next(this.modalContainerRef()));
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
      parseFloat(getComputedStyle(this.modalContainerRef().nativeElement).transitionDuration) > 0;

    // Toggle the @if condition to trigger animate.leave on the dialog
    this.show.set(false);
    this.hideBackdrop();
    this.modalRef?.hidden.next(param);
    this.modalRef?.hidden.complete();
    this.modalRef?.message.complete();

    // For disabled animations or test environments, transitionend won't fire (0s duration)
    if (!isAnimated) {
      this.detachFn?.();
    }
  }

  /** @internal */
  showBackdrop(): void {
    this.showBackdropVisible.set(true);
    this.origBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  private hideBackdrop(): void {
    this.showBackdropVisible.set(false);
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
    this.clickStartInDialog = event.target !== this.modalContainerRef().nativeElement;
  }

  protected onClickStop(event: MouseEvent): void {
    const clickedInBackdrop =
      event.target === this.modalContainerRef().nativeElement && !this.clickStartInDialog;
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
