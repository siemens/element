/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PhoneDetails, SiPhoneNumberInputComponent } from '@siemens/element-ng/phone-number';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiPhoneNumberInputComponent, ReactiveFormsModule, TranslateModule],
  templateUrl: './si-phone-number-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  lastEventValue!: PhoneDetails;
  form = new FormGroup({
    phoneNumber: new FormControl()
  });
}
