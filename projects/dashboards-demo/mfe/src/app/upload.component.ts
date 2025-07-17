/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-upload',
  template: `
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M128,228a12,12,0,0,0,0,24A132.14,132.14,0,0,1,260,384a12,12,0,0,0,24,0C284,298,214,228,128,228Z"
        />
        <path
          d="M128,116a12,12,0,0,0,0,24A244,244,0,0,1,372,384a12,12,0,0,0,24,0A268,268,0,0,0,128,116Z"
        />
        <circle cx="144" cy="368" r="28" />
      </svg>
    </div>
  `,
  styles: ':host { display: block; }'
})
export class UploadComponent {}
