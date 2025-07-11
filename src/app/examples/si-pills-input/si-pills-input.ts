/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiPillsInputComponent,
  SiPillsInputCsvDirective,
  SiPillsInputEmailDirective
} from '@siemens/element-ng/pills-input';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SiPillsInputComponent,
    SiPillsInputCsvDirective,
    SiPillsInputEmailDirective,
    SiFormItemComponent
  ],
  templateUrl: './si-pills-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly group = new FormGroup({
    tagList: new FormControl(['item-1', 'item-2']),
    csv: new FormControl(['item-1', 'item-2']),
    email: new FormControl(['test-user@example.org'])
  });

  readonly = false;
  disabled = false;

  disabledToggled(disabled: boolean): void {
    if (disabled) {
      this.group.disable();
    } else {
      this.group.enable();
    }
  }
}
