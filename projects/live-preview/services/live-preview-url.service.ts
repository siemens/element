/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, inject, Injectable } from '@angular/core';

import { SI_LIVE_PREVIEW_CONFIG } from '../interfaces/live-preview-config';
import { LivePreviewStateService } from './live-preview-state.service';

@Injectable({ providedIn: 'root' })
export class LivePreviewUrlService {
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly state = inject(LivePreviewStateService);
  private readonly document = inject(DOCUMENT);
  // Keep resolution at runtime to avoid Vite rewriting '.' as a filesystem asset.
  private readonly applicationUrl = new URL(
    this.config.applicationUrl ?? '.',
    new URL(import.meta.url)
  );

  readonly origin = this.applicationUrl.origin;
  readonly iframeUrl = this.routeUrl(
    'iframe',
    new URLSearchParams({ parentOrigin: this.document.location.origin })
  );
  readonly examplesBaseUrl = new URL(this.config.examplesBaseUrl, this.applicationUrl).href;

  sourceUrl(path: string): string {
    return new URL(path, this.examplesBaseUrl).href;
  }

  viewerUrl(
    mode: 'editor' | 'viewer' | 'plain',
    options: { skipTemplate?: boolean; deviceMode?: string } = {}
  ): string {
    const parameters = new URLSearchParams({ theme: this.state.theme() });
    if (this.state.isRTL()) {
      parameters.set('isRTL', 'true');
    }
    const locale = this.state.locale();
    if (locale) {
      parameters.set('locale', locale);
    }
    const rootFontSize = this.state.rootFontSize();
    if (rootFontSize) {
      parameters.set('rfs', String(rootFontSize));
    }
    if (options.deviceMode) {
      parameters.set('mode', options.deviceMode);
    }
    if (!options.skipTemplate) {
      const framework = this.state.framework();
      if (framework !== 'angular') {
        parameters.set('t', this.state.activeWebComponentTemplate());
        parameters.set('framework', framework);
      } else if (this.state.templateModified()) {
        parameters.set('t', this.state.template());
      }
    }
    const example = this.state.example();
    if (example) {
      parameters.set('e', example);
    }
    return this.routeUrl(`viewer/${mode}`, parameters);
  }

  issueUrl(template: 'Bug' | 'Feature Request'): string {
    const url = new URL(this.config.ticketBaseUrl, this.document.baseURI);
    url.searchParams.set('issue[title]', `<${this.state.example()}>:`);
    url.searchParams.set('issuable_template', template);
    return url.href;
  }

  private routeUrl(route: string, parameters = new URLSearchParams()): string {
    const url = new URL(this.applicationUrl);
    url.hash = `/${route}${parameters.size ? '?' + parameters : ''}`;
    return url.href;
  }
}
