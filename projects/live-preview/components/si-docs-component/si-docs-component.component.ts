/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';

import { ThemeType } from '../../interfaces/si-live-preview.api';
import { LivePreviewStateService } from '../../services/live-preview-state.service';
import { LivePreviewUrlService } from '../../services/live-preview-url.service';
import { SiLivePreviewComponent } from '../si-live-preview/si-live-preview.component';

/**
 * Documentation component shared with the optional elements entry point.
 * @internal
 */
@Component({
  selector: 'si-docs-component',
  imports: [SiLivePreviewComponent],
  templateUrl: './si-docs-component.component.html',
  styleUrl: './si-docs-component.component.scss',
  providers: [LivePreviewStateService, LivePreviewUrlService],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[style.--preview-height]': 'previewHeight() + "px"'
  }
})
export class SiDocsComponentComponent {
  readonly example = input('');
  readonly base = input('');
  readonly height = input(204, { transform: numberAttribute });
  readonly theme = input<ThemeType>();

  protected readonly state = inject(LivePreviewStateService);
  private readonly document = inject(DOCUMENT);
  private readonly documentTheme = signal<ThemeType>(this.readDocumentTheme());
  protected readonly previewTheme = computed(() => this.theme() ?? this.documentTheme());
  protected readonly previewHeight = computed(() => {
    const height = this.height();
    return Number.isFinite(height) && height >= 0 ? height : 204;
  });

  constructor() {
    const themeObserver = new MutationObserver(() =>
      this.documentTheme.set(this.readDocumentTheme())
    );
    themeObserver.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
    inject(DestroyRef).onDestroy(() => themeObserver.disconnect());

    effect(() => {
      const example = this.example();
      const base = this.base().replace(/\/$/, '');
      this.state.clearTemplates();
      this.state.example.set(example ? `${base ? base + '/' : ''}${example}` : '');
    });
    effect(() => {
      this.state.theme.set(this.previewTheme());
    });
  }

  private readDocumentTheme(): ThemeType {
    return this.document.body.getAttribute('data-md-color-scheme') === 'dark' ? 'dark' : 'light';
  }
}
