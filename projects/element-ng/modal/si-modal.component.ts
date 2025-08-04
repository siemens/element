/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  DOCUMENT
} from '@angular/core';

import { ModalRef } from './modalref';

@Component({
  selector: 'si-modal',
  imports: [A11yModule, NgClass],
  templateUrl: './si-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiModalComponent implements OnInit, AfterViewInit, OnDestroy {
  protected modalRef = inject(ModalRef<unknown, any>);

  protected dialogClass = this.modalRef.dialogClass ?? '';
  protected titleId = this.modalRef.data?.ariaLabelledBy ?? '';
  protected init = false;
  protected readonly show = signal(false);
  protected readonly showBackdropClass = signal<boolean | undefined>(undefined);

  private clickStartInDialog = false;
  private origBodyOverflow?: string;
  private showTimer: any;
  private backdropTimer: any;
  private backdropGhostClickPrevention = true;
  private document = inject(DOCUMENT);

  private readonly modalContainerRef = viewChild.required<ElementRef>('modalContainer');

  ngOnInit(): void {
    setTimeout(() => (this.backdropGhostClickPrevention = false), this.animationTime(300));
    this.init = true;
    this.showTimer = setTimeout(() => {
      this.show.set(true);
    }, this.animationTime(150));
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.modalRef?.shown.next(this.modalContainerRef()));
  }

  ngOnDestroy(): void {
    this.hideBackdrop();
  }

  /** @internal */
  hideDialog(param?: any): void {
    clearTimeout(this.showTimer);

    this.show.set(false);
    // set `detach()` in modal ref to no-op so that the animation is unaffected if called
    const detach = this.modalRef.detach;
    this.modalRef.detach = () => {};

    setTimeout(() => {
      this.hideBackdrop();
      setTimeout(() => detach(), this.animationTime(150));
    }, this.animationTime(300));

    this.modalRef?.hidden.next(param);
    this.modalRef?.hidden.complete();
    this.modalRef?.message.complete();
  }

  /** @internal */
  showBackdrop(): void {
    if (this.modalRef?.data.animated !== false) {
      this.showBackdropClass.set(false);
      this.backdropTimer = setTimeout(() => {
        this.showBackdropClass.set(true);
      }, 16);
    } else {
      this.showBackdropClass.set(true);
    }
    this.origBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  private hideBackdrop(): void {
    clearTimeout(this.backdropTimer);
    if (this.showBackdropClass() !== undefined) {
      this.showBackdropClass.set(false);
    }
    if (this.origBodyOverflow !== undefined) {
      this.document.body.style.overflow = this.origBodyOverflow;
      this.origBodyOverflow = undefined;
    }
  }

  @HostListener('mousedown', ['$event'])
  protected clickStarted(event: MouseEvent): void {
    this.clickStartInDialog = event.target !== this.modalContainerRef().nativeElement;
  }

  @HostListener('mouseup', ['$event'])
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

  @HostListener('window:keydown.esc', ['$event'])
  protected onEsc(event: Event): void {
    if (this.modalRef?.data.keyboard && this.modalRef?.isCurrent()) {
      event.preventDefault();
      this.modalRef.messageOrHide(this.modalRef.closeValue);
    }
  }

  private animationTime(millis: number): number {
    return this.modalRef?.data.animated !== false ? millis : 0;
  }
}
