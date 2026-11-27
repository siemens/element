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
import { type BadgeType, SiBadgeComponent } from '@siemens/element-ng/badge';
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

  readonly variants: { name: BadgeType | 'primary' | 'secondary'; icon: string }[] = [
    { name: 'default', icon: this.icons.elementFaceNeutral },
    { name: 'primary', icon: this.icons.elementFaceNeutral },
    { name: 'secondary', icon: this.icons.elementFaceNeutral },
    { name: 'inverse', icon: this.icons.elementFaceNeutral },
    { name: 'info', icon: this.icons.elementValidationInformation },
    { name: 'success', icon: this.icons.elementValidationSuccess },
    { name: 'warning', icon: this.icons.elementValidationWarning },
    { name: 'danger', icon: this.icons.elementValidationIssue },
    { name: 'critical', icon: this.icons.elementValidationIssue },
    { name: 'caution', icon: this.icons.elementValidationCaution },
    { name: 'info-emphasis', icon: this.icons.elementValidationInformation },
    { name: 'success-emphasis', icon: this.icons.elementValidationSuccess },
    { name: 'warning-emphasis', icon: this.icons.elementValidationWarning },
    { name: 'danger-emphasis', icon: this.icons.elementValidationIssue },
    { name: 'critical-emphasis', icon: this.icons.elementValidationIssue },
    { name: 'caution-emphasis', icon: this.icons.elementValidationCaution }
  ];
}
