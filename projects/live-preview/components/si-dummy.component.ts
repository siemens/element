/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'si-dummy',
  template: `<div class="ion-padding"> Content with path '{{ path }}'</div>`
})
export class SiDummyComponent {
  path = '';
  activeRoute = inject(ActivatedRoute);
  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    this.activeRoute.url.subscribe(url => {
      this.path = url.toString();
      this.cdRef.markForCheck();
    });
  }
}
