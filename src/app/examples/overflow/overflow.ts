/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './overflow.html',
  styles: `
    :host {
      div {
        padding: 0.5rem;
        margin: 0.5rem;
        max-inline-size: 200px;
        max-block-size: 80px;
        background-color: rgb(from var(--element-ui-2) r g b / 0.1);
      }
    }
  `,
  host: {
    class: 'p-5 d-flex gap-4'
  }
})
export class SampleComponent {}
