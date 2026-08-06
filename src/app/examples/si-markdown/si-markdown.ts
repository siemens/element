/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  makeSiMarkdownOptions,
  SiMarkdownCitation,
  SiMarkdownComponent
} from '@siemens/element-ng/markdown';
import { siMarkdownCitations } from '@siemens/element-ng/markdown/extensions/citations';
import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/katex';
import { siMarkdownMermaid } from '@siemens/element-ng/markdown/extensions/mermaid';
import { siMarkdownHighlightJs } from '@siemens/element-ng/markdown/hightlighter/highlightjs';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { LOG_EVENT } from '@siemens/live-preview';
import remarkGemoji from 'remark-gemoji';

interface ScrollMapPoint {
  sourceTop: number;
  outputTop: number;
}

const positionCitationMarker = '[position-citation]';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    JsonPipe,
    SiMarkdownComponent,
    SiNumberInputComponent,
    SiFormItemComponent,
    SiAccordionComponent,
    SiCollapsiblePanelComponent
  ],
  templateUrl: './si-markdown.html'
})
export class SampleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected logEvent = inject(LOG_EVENT);

  protected readonly markdownOptions = computed(() => {
    const opts = makeSiMarkdownOptions();
    if (this.useHighlightJs()) {
      opts.setCodeHighlighter(siMarkdownHighlightJs({ autoDetectLanguage: this.autoDetectLang() }));
    }
    if (this.useCitations()) {
      opts.installExtension(siMarkdownCitations());
    }
    if (this.useKatex()) {
      opts.installExtension(
        // can pass options to KaTeX here. E.g. default rendering is HTML only (speed)
        siMarkdownMathKaTeX(undefined, { output: 'htmlAndMathml' })
      );
    }
    if (this.useMermaid()) {
      opts.installExtension(siMarkdownMermaid());
    }
    if (this.useGemojis()) {
      opts.installUnifiedPlugin(remarkGemoji);
    }

    return opts;
  });

  private readonly lorem =
    'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Non ab amet architecto aspernatur corrupti harum hic, vero ducimus cumque eos delectus doloribus.';
  protected readonly markdownText = signal<string>('');
  protected readonly markdownTextForRenderer = signal<string>('');
  protected readonly citations = computed<SiMarkdownCitation[]>(() => {
    const markdown = this.markdownText();
    const positionStart = markdown.indexOf(positionCitationMarker);
    const citations: SiMarkdownCitation[] = [
      {
        identifier: 'reference-citation',
        name: 'Reference citation',
        url: 'https://element.siemens.io',
        description: 'This is a reference to the Element home page.'
      },
      {
        identifier: 'citation-one',
        name: 'First source with long name',
        url: 'https://example.com/1',
        description: this.lorem
      },
      {
        identifier: 'citation-two',
        name: 'Second source',
        url: 'https://example.com/2',
        description: this.lorem
      },
      {
        identifier: 'citation-three',
        name: 'Third source',
        url: 'https://example.com/3',
        description: this.lorem
      }
    ];

    if (positionStart !== -1) {
      citations.push({
        name: 'Position citation',
        url: 'https://example.com/position',
        description: this.lorem,
        position: {
          startIndex: positionStart,
          endIndex: positionStart + positionCitationMarker.length
        }
      });
    }

    return citations;
  });
  protected readonly streaming = signal(false);
  protected readonly streamIterationDelay = signal(30);
  protected readonly streamCharsPerIteration = signal(15);
  protected readonly keepScrollBottom = signal(false);
  protected readonly scrollSync = signal(true);

  protected readonly useHighlightJs = signal(true);
  protected readonly autoDetectLang = signal(true);
  protected readonly useCitations = signal(true);
  protected readonly useKatex = signal(true);
  protected readonly useMermaid = signal(true);
  protected readonly useGemojis = signal(true);
  protected readonly debug = signal(false);

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private readonly renderedOutput = viewChild.required<ElementRef<HTMLElement>>('renderedOutput');
  private scrollMap?: [key: string, points: ScrollMapPoint[]];
  private syncingElement?: HTMLElement;

  ngOnInit(): void {
    this.http.get('assets/sample-markdown-ext.md', { responseType: 'text' }).subscribe(text => {
      this.markdownText.set(text);
      this.updateRenderer();
    });
  }

  protected updateRenderer(): void {
    if (!this.streaming()) {
      this.markdownTextForRenderer.set(this.markdownText());
    }
  }

  protected start(): void {
    this.streaming.set(true);
    this.streamTextToRenderer();
  }

  protected stop(): void {
    this.streaming.set(false);
    this.updateRenderer();
  }

  private async streamTextToRenderer(): Promise<void> {
    this.markdownTextForRenderer.set('');

    const delay = this.streamIterationDelay();
    const chars = this.streamCharsPerIteration();
    const text = this.markdownText();

    let forRenderer = '';

    while (text.length > forRenderer.length && this.streaming()) {
      forRenderer += text.substring(forRenderer.length, forRenderer.length + chars);
      this.markdownTextForRenderer.set(forRenderer);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.streaming.set(false);
  }

  /* AI generated sync scrolling below */

  protected syncScroll(sourceKey: keyof ScrollMapPoint, targetKey: keyof ScrollMapPoint): void {
    const textarea = this.textarea().nativeElement;
    const output = this.renderedOutput().nativeElement;
    const source = sourceKey === 'sourceTop' ? textarea : output;
    const target = targetKey === 'sourceTop' ? textarea : output;
    if (!this.scrollSync() || this.streaming() || this.syncingElement === source) {
      return;
    }

    const points = this.getScrollMap(textarea, output);
    const sourceTop =
      sourceKey === 'outputTop' ? this.getOutputScrollTop(output) : source.scrollTop;
    const targetTop = this.interpolateScrollPosition(points, sourceTop, sourceKey, targetKey);
    const toPosition =
      targetKey === 'outputTop'
        ? this.keepScrollBottom()
          ? targetTop - output.scrollHeight + output.clientHeight
          : targetTop
        : targetTop;
    this.scrollTo(target, toPosition);
  }

  private getScrollMap(textarea: HTMLTextAreaElement, output: HTMLElement): ScrollMapPoint[] {
    const key = JSON.stringify([
      textarea.value,
      textarea.clientWidth,
      textarea.scrollHeight,
      textarea.clientHeight,
      output.clientWidth,
      output.scrollHeight,
      output.clientHeight,
      this.keepScrollBottom()
    ]);
    if (this.scrollMap?.[0] === key) {
      return this.scrollMap[1];
    }

    const sourceLineOffsets = this.getSourceLineOffsets(textarea);
    const sourceMaxScrollTop = textarea.scrollHeight - textarea.clientHeight;
    const outputMaxScrollTop = output.scrollHeight - output.clientHeight;
    const points: ScrollMapPoint[] = [{ sourceTop: 0, outputTop: 0 }];

    for (const anchor of this.getLineAnchors(output)) {
      const sourceTop = sourceLineOffsets[anchor.line - 1];
      const previous = points.at(-1)!;
      if (
        sourceTop !== undefined &&
        sourceTop < sourceMaxScrollTop &&
        anchor.top < outputMaxScrollTop &&
        sourceTop > previous.sourceTop &&
        anchor.top > previous.outputTop
      ) {
        points.push({ sourceTop, outputTop: anchor.top });
      }
    }

    points.push({ sourceTop: sourceMaxScrollTop, outputTop: outputMaxScrollTop });
    this.scrollMap = [key, points];
    return points;
  }

  private interpolateScrollPosition(
    points: ScrollMapPoint[],
    value: number,
    sourceKey: keyof ScrollMapPoint,
    targetKey: keyof ScrollMapPoint
  ): number {
    const next = points.find(point => point[sourceKey] >= value);
    if (!next) {
      return points.at(-1)?.[targetKey] ?? 0;
    }

    const previous = points.findLast(point => point[sourceKey] <= value);
    if (!previous || previous[sourceKey] === next[sourceKey]) {
      return next[targetKey];
    }

    const progress = (value - previous[sourceKey]) / (next[sourceKey] - previous[sourceKey]);
    return previous[targetKey] + (next[targetKey] - previous[targetKey]) * progress;
  }

  private getLineAnchors(output: HTMLElement): { line: number; top: number }[] {
    const outputTop = output.getBoundingClientRect().top;
    return Array.from(output.querySelectorAll<HTMLElement>('[data-line]'))
      .filter(
        element => !element.closest('.footnotes') && !element.parentElement?.closest('[data-line]')
      )
      .map(element => ({
        line: Number(element.dataset.line),
        top: element.getBoundingClientRect().top - outputTop + this.getOutputScrollTop(output)
      }))
      .filter(anchor => Number.isInteger(anchor.line))
      .toSorted((first, second) => first.line - second.line || first.top - second.top);
  }

  private getOutputScrollTop(output: HTMLElement): number {
    return this.keepScrollBottom()
      ? output.scrollTop + output.scrollHeight - output.clientHeight
      : output.scrollTop;
  }

  private getSourceLineOffsets(textarea: HTMLTextAreaElement): number[] {
    const styles = getComputedStyle(textarea);
    const mirror = document.createElement('div');
    Object.assign(mirror.style, {
      position: 'absolute',
      visibility: 'hidden',
      pointerEvents: 'none',
      left: '-10000px',
      top: '0',
      width: `${textarea.clientWidth}px`,
      boxSizing: 'border-box',
      padding: styles.padding,
      font: styles.font,
      letterSpacing: styles.letterSpacing,
      lineHeight: styles.lineHeight,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      wordBreak: 'break-word'
    });

    const lines = textarea.value.split('\n');
    const lineElements = lines.map((line, index) => {
      const element = document.createElement('span');
      element.textContent = line || '\u200b';
      mirror.append(element);
      if (index < lines.length - 1) {
        mirror.append(document.createElement('br'));
      }
      return element;
    });

    document.body.append(mirror);
    const firstLineTop = lineElements[0].offsetTop;
    const offsets = lineElements.map(element => element.offsetTop - firstLineTop);
    mirror.remove();
    return offsets;
  }

  private scrollTo(element: HTMLElement, scrollTop: number): void {
    if (Math.abs(element.scrollTop - scrollTop) < 1) {
      return;
    }

    this.syncingElement = element;
    element.scrollTop = scrollTop;
    requestAnimationFrame(() => {
      if (this.syncingElement === element) {
        this.syncingElement = undefined;
      }
    });
  }
}
