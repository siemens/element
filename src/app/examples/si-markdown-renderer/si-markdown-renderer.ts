/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { SiMarkdownRendererComponent } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-sample',
  imports: [SiMarkdownRendererComponent],
  templateUrl: './si-markdown-renderer.html'
})
export class SampleComponent {
  readonly markdownText = httpResource.text(() => 'assets/sample-markdown.md');
}
