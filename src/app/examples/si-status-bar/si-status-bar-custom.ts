/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiCircleStatusModule } from '@siemens/element-ng/circle-status';
import { BlinkService } from '@siemens/element-ng/common';
import { SiStatusBarComponent, StatusBarItem } from '@siemens/element-ng/status-bar';
import { LOG_EVENT } from '@siemens/live-preview';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [SiStatusBarComponent, SiCircleStatusModule],
  templateUrl: './si-status-bar-custom.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);

  muteButton = false;
  blinkOn = false;

  statusItems: StatusBarItem[] = [
    { title: 'Emergency', color: '#f00', value: 4, action: item => this.logEvent(item) },
    { title: 'Life safety', color: '#f00', value: 0, action: item => this.logEvent(item) },
    { title: 'Security', color: '#fa0', value: 0 },
    { title: 'Supervisory', color: '#f08', value: 0 },
    { title: 'Trouble', color: '#f80', value: 42, action: item => this.logEvent(item) },
    { title: 'Caution', color: '#ff0', value: 200, action: item => this.logEvent(item) },
    {
      title: "Nasty long text that won't fit",
      color: '#008080',
      blink: false,
      value: 1,
      action: item => this.logEvent(item)
    },
    { title: 'Not clickable', color: '#00f', value: 37 },
    { title: 'More stuff', color: '#f00', value: 4, action: item => this.logEvent(item) },
    { title: 'Coffee machines', color: '#f00', value: 2, action: item => this.logEvent(item) },
    { title: 'Test', color: '#fa0', value: 2 },
    { title: 'Supervisory', color: '#f08', value: 2 },
    { title: 'Trouble', color: '#f80', value: 42, action: item => this.logEvent(item) },
    { title: 'Warnings', color: '#f80', value: 200, action: item => this.logEvent(item) },
    {
      title: 'Nasty long text',
      color: '#008080',
      blink: false,
      value: 1,
      action: item => this.logEvent(item)
    }
  ];

  shouldBlink = !navigator.webdriver;

  private addBlinkSubs?: Subscription;
  private blink = inject(BlinkService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // disable updating content in e2e tests
    if (!navigator.webdriver) {
      const origValues = this.statusItems.map(item => item.value);

      timer(5000, 7000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.statusItems[3].value = this.statusItems[3].value ? 0 : 5;
        });

      timer(15000, 17000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.statusItems[0].value) {
            this.statusItems.forEach(item => (item.value = 0));
          } else {
            this.statusItems.forEach((item, i) => (item.value = origValues[i]));
          }
        });
    }
  }

  pause(): void {
    this.blink.pause();
  }

  resume(): void {
    this.blink.resume();
  }

  toggleBlinkButton(): void {
    if (this.addBlinkSubs) {
      this.addBlinkSubs.unsubscribe();
      this.addBlinkSubs = undefined;
    } else {
      this.addBlinkSubs = this.blink.pulse$.subscribe(onOff => (this.blinkOn = onOff));
    }
  }
}
