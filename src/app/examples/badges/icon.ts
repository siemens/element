/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  elementFaceNeutral,
  elementValidationCaution,
  elementValidationInformation,
  elementValidationIssue,
  elementValidationSuccess,
  elementValidationWarning
} from '@siemens/element-icons';
import { SiBadgeComponent } from '@siemens/element-ng/badge';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiBadgeComponent, SiIconComponent],
  templateUrl: './icon.html',
  host: {
    class: 'p-5 background-1'
  }
})
export class SampleComponent {
  readonly icons = addIcons({
    elementFaceNeutral,
    elementValidationCaution,
    elementValidationInformation,
    elementValidationIssue,
    elementValidationSuccess,
    elementValidationWarning
  });
}
