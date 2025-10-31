/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './flex-wrap.html',
  styles: `
    :host {
      .d-flex {
        inline-size: 300px;
      }
      .d-flex > div {
        padding: 0.5rem;
      }
      .example div {
        border: 1px solid rgb(from var(--element-action-primary) r g b / 0.3);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
