/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './borders.html',
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
        background-color: rgb(from var(--element-ui-2) r g b / 0.3);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
