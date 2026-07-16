/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal, TemplateRef } from '@angular/core';

/**
 * Token to pass the si-markdown component w/o circular dependencies.
 */
export const SI_MARKDOWN_CONTROL = new InjectionToken<SiMarkdownControl>('si.markdown.control');

/**
 * Interface of si-markdown exposed to children.
 */
export interface SiMarkdownControl {
  templates: Signal<Map<string, TemplateRef<any>>>;
  debug: Signal<boolean>;
}
