/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SiAutoCollapsableListMeasurable } from './si-auto-collapsable-list-measurable.class';

@Directive({
  selector: '[siAutoCollapsableListAdditionalContent]'
})
export class SiAutoCollapsableListAdditionalContentDirective extends SiAutoCollapsableListMeasurable {}
