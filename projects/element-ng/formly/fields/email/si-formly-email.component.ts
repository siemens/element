/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-email',
  templateUrl: './si-formly-email.component.html',
  imports: [FormsModule, ReactiveFormsModule, FormlyModule]
})
export class SiFormlyEmailComponent extends FieldType<FieldTypeConfig> {
  // Patterns are not recommended to validate email addresses.
  // See https://tools.ietf.org/html/rfc2822 to get a feeling of possible email address formats
  // This pattern is from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
  // public readonly pattern =
  // /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
}
