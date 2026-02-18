/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './text-wrap.html',
  styles: `
    :host {
      div {
        padding: 0.5rem;
        margin: 0.5rem;
        background-color: rgb(from var(--element-ui-2) r g b / 0.1);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
