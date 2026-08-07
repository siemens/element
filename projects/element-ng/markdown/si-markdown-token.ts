/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, OutputEmitterRef, Signal, TemplateRef } from '@angular/core';

import { SiMarkdownMetadata } from './si-markdown.types';

/**
 * Token to pass the si-markdown component w/o circular dependencies.
 */
export const SI_MARKDOWN_CONTROL = new InjectionToken<SiMarkdownControl>('si.markdown.control');

/**
 * Interface of si-markdown exposed to children.
 */
export interface SiMarkdownControl {
  templates: Signal<Map<string, TemplateRef<any>>>;
  meta: Signal<SiMarkdownMetadata>;
  debug: Signal<boolean>;
  extensionEvent: OutputEmitterRef<{ name: string; data: any }>;
}
