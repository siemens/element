/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgComponentOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { elementCopy, elementOk } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Code, type Node, type Parent } from 'mdast';

import { SiMarkdownHighlighter, SiMarkdownExtensionComponent } from '../../si-markdown.types';

export interface MarkdownCodeOptions {
  getHighlighter: () => SiMarkdownHighlighter | undefined;
}

@Component({
  selector: 'si-markdown-code',
  imports: [NgComponentOutlet, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-markdown-code.component.html',
  host: {
    class: 'd-flex flex-column px-6 py-5 mb-6 border rounded'
  }
})
export class SiMarkdownCodeComponent implements SiMarkdownExtensionComponent {
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();

  readonly options = input<MarkdownCodeOptions>();

  protected labelCopy = t(() => $localize`:@@SI_MARKDOWN.COPY_CODE:Copy code`);
  protected labelCopied = t(() => $localize`:@@SI_MARKDOWN.COPIED_CODE:Copied`);
  protected readonly code = computed(() => (this.node() as Code).value);
  protected readonly language = computed(() => (this.node() as Code).lang);
  protected readonly highlighter = computed(() => this.options()?.getHighlighter());
  protected readonly languageToDisplay = linkedSignal(() => this.language());
  protected readonly copied = signal(false);

  protected readonly updateLanguage = (lang?: string): void => this.languageToDisplay.set(lang);

  constructor() {
    addIcons({ elementCopy, elementOk });
  }

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
