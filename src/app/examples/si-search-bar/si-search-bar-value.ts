/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [SiSearchBarComponent, SiSearchBarInputDirective, ReactiveFormsModule],
  templateUrl: './si-search-bar-value.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  control = new FormControl('hello123', { nonNullable: true });

  constructor() {
    this.control.valueChanges
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe(this.logEvent);
  }
}
