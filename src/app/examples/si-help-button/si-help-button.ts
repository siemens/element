/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiHelpButtonComponent } from '@siemens/element-ng/help-button';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiHelpButtonComponent, SiFormItemComponent, ReactiveFormsModule],
  templateUrl: './si-help-button.html',
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  private log = inject(LOG_EVENT);
  readonly disabledHelp = new FormControl(false);

  solve(): void {
    this.log('Solution');
  }
}
