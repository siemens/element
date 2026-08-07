/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './gutters.html',
  styles: `
    :host {
      .row > div {
        padding: 0.5rem;
      }
      .col > div,
      .col-6 > div {
        border: 1px solid var(--si-sys-border-information);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
