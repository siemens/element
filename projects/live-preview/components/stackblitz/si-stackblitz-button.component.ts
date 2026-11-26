/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, inject, input, resource } from '@angular/core';

import { LivePreviewUrlService } from '../../services/live-preview-url.service';
import { loadStackblitzProject, openStackblitz } from './stackblitz';
import { SI_STACKBLITZ_CONFIG } from './stackblitz.provider';

@Directive({
  selector: 'button[siStackblitz]',
  host: {
    'title': 'Open Stackblitz',
    'attr.aria-label': 'Open in Stackblitz',
    '[style.display]': '!config ? "none" : null',
    '[disabled]': 'disabled()',
    '(click)': 'openStackblitz()'
  }
})
export class SiStackblitzButtonDirective {
  protected readonly config = inject(SI_STACKBLITZ_CONFIG, { optional: true });
  private readonly urls = inject(LivePreviewUrlService);

  /** Framework to use for the Stackblitz project. */
  readonly framework = input.required<string>();

  /** The example base URL. */
  readonly baseUrl = input.required<string>();

  /** The example name. */
  readonly example = input<string | null>();

  private readonly template = computed(() =>
    this.config?.templates.find(item => item.name === this.framework())
  );

  // Loaded upfront, so that the click handler can open Stackblitz synchronously.
  private readonly project = resource({
    params: () => {
      const template = this.template();
      const example = this.example();
      return template && example ? { template, example, baseUrl: this.baseUrl() } : undefined;
    },
    loader: ({ params, abortSignal }) =>
      loadStackblitzProject({
        ...params,
        // Resolve template assets against the live preview, which isn't the page in the docs.
        assetBaseUrl: this.urls.applicationUrl.href,
        signal: abortSignal
      })
  });

  /** Indicate whether a stackblitz isn't available. */
  protected readonly disabled = computed(() => !this.project.hasValue());

  /** Open the Stackblitz editor with the specified configuration. */
  protected openStackblitz(): void {
    if (this.project.hasValue()) {
      openStackblitz(this.project.value());
    }
  }
}
