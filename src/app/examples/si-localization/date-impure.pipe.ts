/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateImpure',
  pure: false, // eslint-disable-line @angular-eslint/no-pipe-impure
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false
})
export class DateImpurePipe extends DatePipe implements PipeTransform {}
