/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { Component, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiToolMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-sample',
  imports: [SiToolMessageComponent],
  templateUrl: './si-tool-message.html'
})
export class SampleComponent {
  private sanitizer = inject(DomSanitizer);
  private doc = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected markdownRenderer = getMarkdownRenderer(
    this.sanitizer,
    undefined,
    this.doc,
    this.isBrowser
  );

  toolName = 'fetch_weather_data';

  inputArguments = {
    location: 'San Francisco, CA',
    units: 'metric'
  };

  output = {
    temperature: 18,
    condition: 'partly_cloudy',
    humidity: 65
  };
}
