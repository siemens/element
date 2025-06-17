/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-search-bar.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiSearchBarComponent, ReactiveFormsModule]
})
export class SampleComponent implements OnInit {
  control = new FormControl('');

  logEvent = inject(LOG_EVENT);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.logEvent);
  }
}
