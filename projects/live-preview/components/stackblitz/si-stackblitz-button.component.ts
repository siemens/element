/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { httpResource } from '@angular/common/http';
import { computed, Directive, inject, input } from '@angular/core';

import { openStackblitz } from './stackblitz';
import { SI_STACKBLITZ_CONFIG } from './stackblitz.provider';

@Directive({
  selector: 'button[siStackblitz]',
  host: {
    'title': 'Open Stackblitz',
    'attr.aria-label': 'Open in Stackblitz',
    '[disabled]': 'disabled()',
    '(click)': 'openStackblitz()'
  }
})
export class SiStackblitzButtonDirective {
  private readonly config = inject(SI_STACKBLITZ_CONFIG);
  private readonly exampleTs = httpResource.text(() => `${this.baseUrl()}${this.example()}.ts`);
  private readonly isExample = computed(() => {
    if (this.exampleTs.hasValue()) {
      const content = this.exampleTs.value();
      return /selector: 'app-sample'/gm.test(content);
    }
    return false;
  });
  /** Framework to use for the Stackblitz project. */
  readonly framework = input.required<string>();

  /** The example base URL. */
  readonly baseUrl = input.required<string>();

  /** The example name. */
  readonly example = input<string | null>();

  /** Indicate whether a stackblitz isn't available. */
  protected readonly disabled = computed(
    () =>
      !this.config.templates.find(item => item.name === this.framework()) ||
      !this.example() ||
      !this.isExample()
  );

  /** Open the Stackblitz editor with the specified configuration. */
  protected async openStackblitz(): Promise<void> {
    await openStackblitz({
      framework: this.framework(),
      example: this.example()!,
      templates: this.config.templates,
      baseUrl: this.baseUrl()
    });
  }
}
