/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Portal } from '@angular/cdk/portal';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiSidePanelService {
  private contentSubject = new BehaviorSubject<Portal<any> | undefined>(undefined);
  /** @internal */
  readonly content$ = this.contentSubject.asObservable();

  private openSubject = new BehaviorSubject<boolean>(false);
  /**
   * Emits on side panel is open or close.
   *
   * @defaultValue this.openSubject.asObservable()
   */
  readonly isOpen$ = this.openSubject.asObservable();

  private tempContentSubject = new BehaviorSubject<Portal<any> | undefined>(undefined);
  /** @internal */
  readonly tempContent$ = this.tempContentSubject.asObservable();

  private tempContentClosed?: Subject<void>;
  /** @internal */
  readonly enableMobile = signal(false);

  /** @internal */
  readonly collapsible = signal(false);

  private fullscreenSubject = new BehaviorSubject<boolean>(false);
  /**
   * Emits when fullscreen overlay mode is toggled.
   */
  readonly isFullscreen$ = this.fullscreenSubject.asObservable();

  // Body scroll management
  private bodyScrollLocks = 0;
  private originalBodyOverflow?: string;
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Set or update displayed content. */
  setSidePanelContent(portal: Portal<any> | undefined): void {
    this.contentSubject.next(portal);
  }

  /** Open side panel. */
  open(): void {
    this.hideTemporaryContent();
    this.openSubject.next(true);
  }

  /** Close side panel. */
  close(): void {
    if (this.hideTemporaryContent()) {
      return;
    }
    this.openSubject.next(false);
  }

  /** Toggle side panel open/close. */
  toggle(): void {
    this.hideTemporaryContent();
    this.openSubject.next(!this.openSubject.value);
  }

  /** Indicate is side panel open. */
  isOpen(): boolean {
    return this.openSubject.value;
  }

  /** Toggle fullscreen overlay mode. */
  toggleFullscreen(): void {
    this.fullscreenSubject.next(!this.fullscreenSubject.value);
  }

  /** Set fullscreen overlay mode. */
  setFullscreen(fullscreen: boolean): void {
    this.fullscreenSubject.next(fullscreen);
  }

  /** Indicate if side panel is in fullscreen overlay mode. */
  isFullscreen(): boolean {
    return this.fullscreenSubject.value;
  }

  /**
   * Indicate that the side panel is open with temporary content.
   */
  isTemporaryOpen(): boolean {
    return !!this.tempContentSubject.value;
  }

  /** Show side panel temporary content, opening the side panel when necessary. */
  showTemporaryContent(portal: Portal<any> | undefined): Observable<void> {
    this.hideTemporaryContent();
    this.tempContentSubject.next(portal);

    if (portal) {
      this.tempContentClosed = new Subject();
      return this.tempContentClosed.asObservable();
    }
    return EMPTY;
  }

  /** Hide side panel temporary content, reverting to state before showing temporary content. */
  hideTemporaryContent(): boolean {
    if (!this.isTemporaryOpen()) {
      return false;
    }
    if (this.tempContentClosed) {
      const sub = this.tempContentClosed;
      this.tempContentClosed = undefined;
      sub.next();
      sub.complete();
    }
    this.tempContentSubject.next(undefined);
    return true;
  }

  /**
   * Request body scroll lock. Uses reference counting to handle multiple panels.
   */
  requestBodyScrollLock(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.bodyScrollLocks === 0) {
      this.originalBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }
    this.bodyScrollLocks++;
  }

  /**
   * Release body scroll lock. Restores scroll when no more locks exist.
   */
  releaseBodyScrollLock(): void {
    if (!this.isBrowser || this.bodyScrollLocks === 0) {
      return;
    }

    this.bodyScrollLocks--;
    if (this.bodyScrollLocks === 0 && this.originalBodyOverflow !== undefined) {
      this.document.body.style.overflow = this.originalBodyOverflow;
      this.originalBodyOverflow = undefined;
    }
  }
}
