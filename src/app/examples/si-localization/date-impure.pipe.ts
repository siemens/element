/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateImpure',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  pure: false // eslint-disable-line @angular-eslint/no-pipe-impure
})
export class DateImpurePipe extends DatePipe implements PipeTransform {}
