/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './position-arrangement.html',
  styles: `
    :host {
      > div {
        block-size: 6rem;
      }
      div {
        padding: 0.5rem;
        background-color: rgb(from var(--element-ui-2) r g b / 0.3);
      }
    }
  `,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {}
