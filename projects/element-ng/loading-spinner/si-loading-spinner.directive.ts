/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import {
  ApplicationRef,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  StaticProvider
} from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Subscription, timer } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

import {
  LOADING_SPINNER_BLOCKING,
  LOADING_SPINNER_OVERLAY,
  SiLoadingSpinnerComponent
} from './si-loading-spinner.component';
@Directive({
  selector: '[siLoading]',
  host: {
    class: 'position-relative'
  }
})
export class SiLoadingSpinnerDirective implements OnInit, OnChanges, OnDestroy {
  /**
   * Displays the loading spinner when the value is either true or non-zero.
   */
  readonly siLoading = input.required<boolean | number>();

  /**
   * Displays semi-transparent backdrop for the spinner, default is false.
   *
   * @defaultValue false
   */
  readonly blocking = input(false, { transform: booleanAttribute });

  /**
   * Specifies if the spinner should be displayed after a delay, default is true.
   *
   * @defaultValue true
   */
  readonly initialDelay = input(true, { transform: booleanAttribute });

  private el = inject(ElementRef);
  private appRef = inject(ApplicationRef);

  private sub?: Subscription;
  private progressSubject = new BehaviorSubject(false);
  private off$ = this.progressSubject.pipe(filter(val => !val));
  private on$ = this.progressSubject.pipe(filter(val => val));
  private readonly initialWaitTime = computed(() => (this.initialDelay() ? 500 : 0));
  private minSpinTime = 500;
  private compPortal = new ComponentPortal(SiLoadingSpinnerComponent);

  // this makes sure the spinner only displays with a delay of 500ms and stays for 500ms so
  // that it doesn't flicker
  protected readonly spinner$ = this.on$.pipe(
    switchMap(() =>
      merge(
        timer(this.initialWaitTime()).pipe(
          map(() => true),
          takeUntil(this.off$)
        ),
        combineLatest([this.off$, timer(this.initialWaitTime() + this.minSpinTime)]).pipe(
          map(() => false)
        )
      )
    )
  );

  private createPortal(): void {
    const providers: StaticProvider[] = [
      { provide: LOADING_SPINNER_BLOCKING, useValue: this.blocking() },
      {
        provide: LOADING_SPINNER_OVERLAY,
        useValue: true
      }
    ];
    const outlet = new DomPortalOutlet(
      this.el.nativeElement,
      undefined,
      this.appRef,
      Injector.create({ providers })
    );
    this.compPortal.attach(outlet);
  }

  ngOnInit(): void {
    this.sub = this.spinner$.subscribe(val => {
      if (val) {
        if (!this.compPortal.isAttached) {
          this.createPortal();
        }
      } else if (this.compPortal.isAttached) {
        this.compPortal.detach();
      }
    });
  }

  ngOnChanges(): void {
    const newState = !!this.siLoading();
    if (newState !== this.progressSubject.value) {
      this.progressSubject.next(newState);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.compPortal.isAttached) {
      this.compPortal.detach();
    }
  }
}
