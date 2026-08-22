/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type TypeHandler } from '@siemens/element-ng/markdown';

import { SiMarkdownTabsetComponent } from './si-markdown-tabset.component';

export const siMarkdownTabsetDirective = (): TypeHandler => ({
  type: 'tabset',
  component: SiMarkdownTabsetComponent
});
