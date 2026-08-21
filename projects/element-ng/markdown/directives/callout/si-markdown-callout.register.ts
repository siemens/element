/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TypeHandler } from '../../si-markdown.types';
import { SiMarkdownCalloutComponent } from './si-markdown-callout.component';

export const siMarkdownCalloutDirective = (): TypeHandler => ({
  type: 'callout',
  component: SiMarkdownCalloutComponent
});
