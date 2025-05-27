/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BlinkService } from '@siemens/element-ng/common';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiStatusBarComponent, StatusBarItem } from '@siemens/element-ng/status-bar';
import { LOG_EVENT } from '@siemens/live-preview';
import { timer } from 'rxjs';

@Component({
  selector: 'app-sample',
  templateUrl: './si-status-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFormItemComponent, SiStatusBarComponent, FormsModule]
})
export class SampleComponent implements OnInit {
  readonly logEvent = inject(LOG_EVENT);

  muteButton? = false;
  compact = false;
  showMute = true;
  customContent = false;

  readonly statusItems: StatusBarItem[] = [
    { title: 'Emergency', status: 'critical', value: 4, action: item => this.logEvent(item) },
    { title: 'Life safety', status: 'danger', value: 0, action: item => this.logEvent(item) },
    { title: 'Security', status: 'danger', value: 0 },
    { title: 'Supervisory', status: 'danger', value: 0 },
    { title: 'Trouble', status: 'warning', value: 42, action: item => this.logEvent(item) },
    { title: 'Caution', status: 'caution', value: 200, action: item => this.logEvent(item) },
    { title: 'Nasty long text', status: 'info', value: 1, action: item => this.logEvent(item) },
    { title: 'Not clickable', status: 'info', value: 37 }
  ];

  shouldBlink = !navigator.webdriver;
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
}
