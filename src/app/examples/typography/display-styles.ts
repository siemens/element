/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: `
    <h1 class="si-display-xl">Display 1</h1>
    <h1 class="si-display-lg">Display 2</h1>
    <h1 class="si-display-bold">Display 3</h1>
    <h1 class="si-display">Display 4</h1>
  `,
  host: { class: 'p-5' }
})
export class SampleComponent {}
