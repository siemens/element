/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkMenuTrigger],
  templateUrl: './buttontypes.html',
  host: {
    class: 'bg-base-1'
  }
})
export class SampleComponent {
  disabled = false;
  splitOpen1 = false;
  splitOpen2 = false;
  splitOpen3 = false;
  splitOpen4 = false;
  splitOpen5 = false;
  splitOpen6 = false;

  menuItems = [
    { icon: 'element-download', text: 'Download as PDF' },
    { icon: 'element-download', text: 'Download as CSV' },
    { icon: 'element-share', text: 'Share' }
  ];
}
