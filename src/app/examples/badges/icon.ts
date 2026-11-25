/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { type BadgeType, SiBadgeComponent } from '@siemens/element-ng/badge';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiBadgeComponent, SiIconComponent],
  templateUrl: './icon.html',
  host: {
    class: 'p-5 background-1'
  }
})
export class SampleComponent {
  readonly variants: { name: BadgeType | 'primary' | 'secondary'; icon: string }[] = [
    { name: 'default', icon: 'element-face-neutral' },
    { name: 'primary', icon: 'element-face-neutral' },
    { name: 'secondary', icon: 'element-face-neutral' },
    { name: 'inverse', icon: 'element-face-neutral' },
    { name: 'info', icon: 'element-validation-information' },
    { name: 'success', icon: 'element-validation-success' },
    { name: 'warning', icon: 'element-validation-warning' },
    { name: 'danger', icon: 'element-validation-issue' },
    { name: 'critical', icon: 'element-validation-issue' },
    { name: 'caution', icon: 'element-validation-caution' },
    { name: 'info-emphasis', icon: 'element-validation-information' },
    { name: 'success-emphasis', icon: 'element-validation-success' },
    { name: 'warning-emphasis', icon: 'element-validation-warning' },
    { name: 'danger-emphasis', icon: 'element-validation-issue' },
    { name: 'critical-emphasis', icon: 'element-validation-issue' },
    { name: 'caution-emphasis', icon: 'element-validation-caution' }
  ];
}
