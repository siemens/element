/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'si-dummy',
  template: `<div class="ion-padding"> Content with path '{{ path }}'</div>`
})
export class SiDummyComponent {
  path = '';

  constructor(activeRoute: ActivatedRoute) {
    activeRoute.url.subscribe(url => (this.path = url.toString()));
  }
}
