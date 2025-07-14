/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Portal } from '@angular/cdk/portal';
import { Injectable, signal } from '@angular/core';
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
}
