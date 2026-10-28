/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { ɵSiDocsComponentComponent as SiDocsComponentComponent } from '@siemens/live-preview';

/** Registers the existing documentation markup as live-preview custom elements. */
export const defineLivePreviewElements = (injector: Injector): void => {
  customElements.define('si-docs-tab', class extends HTMLElement {});
  customElements.define(
    'si-docs-component',
    createCustomElement(SiDocsComponentComponent, { injector })
  );
};
