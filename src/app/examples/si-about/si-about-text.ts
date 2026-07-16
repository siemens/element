/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiAboutComponent } from '@siemens/element-ng/about';

@Component({
  selector: 'app-sample',
  imports: [SiAboutComponent],
  templateUrl: './si-about-text.html'
})
export class SampleComponent {
  actionLink = { title: 'Link with action', action: () => alert('Link clicked!') };
}
