/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  addIcons,
  element2dEditor,
  elementAlarmFilled,
  elementAlarmTick,
  elementCancel,
  elementUser,
  SiIconModule,
  SiIconComponent
} from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiIconModule, SiIconComponent],
  templateUrl: './si-icon.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  // addIcons returns a map of all names added to the library for typesafe use in the template.
  icons = addIcons({
    elementUser,
    elementCancel,
    element2dEditor,
    elementAlarmFilled,
    elementAlarmTick
  });
}
