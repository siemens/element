/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './max-size.html',
  styles: `
    :host {
      div {
        background-color: rgb(from var(--element-ui-2) r g b / 0.3);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
