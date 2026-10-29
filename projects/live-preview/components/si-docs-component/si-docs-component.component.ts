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
  ElementRef,
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

interface DocsExample {
  example: string;
  heading: string;
}

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly documentTheme = signal<ThemeType>(this.readDocumentTheme());
  private readonly childExamples = signal<DocsExample[]>([]);
  protected readonly previewTheme = computed(() => this.theme() ?? this.documentTheme());
  protected readonly activeTabIndex = signal(0);
  protected readonly previewHeight = computed(() => {
    const height = this.height();
    return Number.isFinite(height) && height >= 0 ? height : 204;
  });
  protected readonly tabs = computed(() => [
    ...(this.example() ? [{ example: this.example(), heading: '' }] : []),
    ...this.childExamples()
  ]);

  constructor() {
    const readTabs = (): void => {
      this.childExamples.set(
        Array.from(this.host.querySelectorAll(':scope > si-docs-tab[example]'), tab => ({
          example: tab.getAttribute('example') ?? '',
          heading: tab.getAttribute('heading') ?? ''
        }))
      );
    };
    readTabs();
    const observer = new MutationObserver(readTabs);
    observer.observe(this.host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['example', 'heading']
    });
    const themeObserver = new MutationObserver(() =>
      this.documentTheme.set(this.readDocumentTheme())
    );
    themeObserver.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
    inject(DestroyRef).onDestroy(() => {
      observer.disconnect();
      themeObserver.disconnect();
    });

    effect(() => {
      this.tabs();
      this.activeTabIndex.set(0);
    });
    effect(() => {
      const tab = this.tabs()[this.activeTabIndex()];
      const base = this.base().replace(/\/$/, '');
      this.state.clearTemplates();
      this.state.example.set(tab ? `${base ? base + '/' : ''}${tab.example}` : '');
    });
    effect(() => {
      this.state.theme.set(this.previewTheme());
    });
  }

  private readDocumentTheme(): ThemeType {
    return this.document.body.getAttribute('data-md-color-scheme') === 'dark' ? 'dark' : 'light';
  }

  protected activateTab(index: number, focus = false): void {
    this.activeTabIndex.set(index);
    if (focus) {
      this.host.shadowRoot?.querySelector<HTMLButtonElement>(`#example-tab-${index}`)?.focus();
    }
  }
}
