/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideWebsemTools } from '@websem/angular';

import { DocsChatComponent } from './app/docs-chat.component';
import { createDocsSearchConfig } from './docs-search.config';
import { isLanguageModelAvailable } from './prompt-api';

const tagName = 'si-docs-chat';
const indexUrl = new URL('../../websem/index/', import.meta.url).href;
const application = await createApplication({
  providers: [provideWebsemTools(createDocsSearchConfig(indexUrl))]
});

if (await isLanguageModelAvailable()) {
  if (!customElements.get(tagName)) {
    customElements.define(
      tagName,
      createCustomElement(DocsChatComponent, { injector: application.injector })
    );
  }

  const mount = (): void => {
    if (document.querySelector(tagName)) {
      return;
    }
    const element = document.createElement(tagName);
    element.setAttribute('index-url', indexUrl);
    document.body.append(element);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}
