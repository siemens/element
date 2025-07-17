/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-download',
  template: `
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M318.63,304a108.1,108.1,0,0,0-125.1,0,12,12,0,0,0,13.9,19.56,84.09,84.09,0,0,1,97.3,0A12,12,0,1,0,318.63,304Z"
        />
        <path
          d="M377,247.56a188,188,0,0,0-240.64,0A12,12,0,1,0,151.68,266a164,164,0,0,1,209.92,0A12,12,0,0,0,377,247.56Z"
        />
        <path
          d="M433.21,191a268,268,0,0,0-354.42,0,12,12,0,1,0,15.86,18,244,244,0,0,1,322.7,0,12,12,0,0,0,15.86-18Z"
        />
        <circle cx="256" cy="372.22" r="16" />
      </svg>
    </div>
  `,
  styles: ':host { display: block; }'
})
export class DownloadComponent {}
