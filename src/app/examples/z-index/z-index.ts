/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './z-index.html',
  styles: `
    :host {
      div {
        min-inline-size: 8rem;
        min-block-size: 8rem;
        background-color: rgb(from var(--element-ui-2) r g b / 0.2);
      }
      div > span {
        position: absolute;
        right: 5px;
        bottom: 0;
      }
      :nth-child(2) {
        top: 2rem;
        left: 2rem;
      }
      :nth-child(3) {
        top: 3rem;
        left: 3rem;
      }
      :nth-child(4) {
        top: 4rem;
        left: 4rem;
      }
      :nth-child(5) {
        top: 5rem;
        left: 5rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5 position-relative'
  }
})
export class SampleComponent {}
