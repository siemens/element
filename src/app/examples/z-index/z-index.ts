/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './z-index.html',
  styles: `
    :host {
      div {
        min-inline-size: 8rem;
        min-block-size: 8rem;
        background-color: rgb(from var(--si-sys-color-background-information) r g b / 0.2);
      }
      div > span {
        position: absolute;
        inset-inline-end: 5px;
        inset-block-end: 0;
      }
      :nth-child(2) {
        inset-block-start: 2rem;
        inset-inline-start: 2rem;
      }
      :nth-child(3) {
        inset-block-start: 3rem;
        inset-inline-start: 3rem;
      }
      :nth-child(4) {
        inset-block-start: 4rem;
        inset-inline-start: 4rem;
      }
      :nth-child(5) {
        inset-block-start: 5rem;
        inset-inline-start: 5rem;
      }
    }
  `,
  host: {
    class: 'p-5 position-relative'
  }
})
export class SampleComponent {}
