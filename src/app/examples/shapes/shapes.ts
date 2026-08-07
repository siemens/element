/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './shapes.html',
  styles: `
    :host {
      .example {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-block-end: 1rem;
      }
      span {
        padding: 2rem;
        background-color: var(--si-sys-background-information-subtle);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
