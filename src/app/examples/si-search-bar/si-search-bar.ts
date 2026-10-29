/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';
import { debounceTime, filter } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [SiSearchBarComponent, SiSearchBarInputDirective, ReactiveFormsModule],
  templateUrl: './si-search-bar.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);

  control = new FormControl('', {
    nonNullable: true,
    validators: Validators.pattern(/^[^*?]*$/)
  });
  base0Control = new FormControl('', {
    nonNullable: true,
    validators: Validators.pattern(/^[^*?]*$/)
  });

  constructor() {
    for (const control of [this.control, this.base0Control]) {
      control.valueChanges
        .pipe(
          filter(() => control.valid),
          debounceTime(400),
          takeUntilDestroyed()
        )
        .subscribe(this.logEvent);
    }
  }
}
