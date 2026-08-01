/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import CodeFlask from 'codeflask';
import { Subject } from 'rxjs';
import { retry, throttleTime, timeout } from 'rxjs/operators';

import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import 'prismjs/components/prism-typescript';

import { SiLivePreviewLocaleApi } from '../../interfaces/si-live-preview.api';
import { SiLivePreviewIframeComponent } from '../si-live-preview-iframe/si-live-preview-iframe.component';
import { SiStackblitzButtonDirective } from '../stackblitz/si-stackblitz-button.component';

@Component({
  selector: 'si-live-preview',
  imports: [KeyValuePipe, FormsModule, SiLivePreviewIframeComponent, SiStackblitzButtonDirective],
  templateUrl: './si-live-preview.component.html',
  styleUrls: ['./si-live-preview.component.scss', './si-live-preview-codeflask.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.editor-fullscreen]': 'isFullscreen()',
    '[class.is-mobile]': 'isMobile',
    '(document:fullscreenchange)': 'onFullscreenChange()',
    '(document:webkitfullscreenchange)': 'onFullscreenChange()'
  }
})
export class SiLivePreviewComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly self = inject(ElementRef);
  private readonly http = inject(HttpClient);
  protected readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });

  protected readonly templateElem = viewChild.required<ElementRef>('codeTemplate');
  protected readonly typescriptElem = viewChild.required<ElementRef>('codeTypescript');
  protected readonly reactVueElem = viewChild.required<ElementRef>('codeReactVue');
  protected readonly consoleElem = viewChild.required<ElementRef>('consoleContainer');

  readonly baseUrl = input.required<string>();
  readonly example = input<string | null | undefined>();
  readonly template = model('');
  readonly theme = model<string>('light');
  readonly locale = model<string | null | undefined>();
  readonly isRTL = model<boolean>(false);
  readonly ticketBaseUrl = input('');
  readonly templateReact = model('');
  readonly templateVue = model('');
  readonly templateJs = model('');

  protected readonly isFullscreen = signal(false);
  protected readonly isMobile = this.internalConfig.isMobile;

  private templateTs = '';
  protected readonly renderingError = signal<any>(null);
  protected readonly logMessages = signal<string[]>([]);
  protected readonly activeTab = signal<string>('template');
  protected readonly showCopied = signal(false);
  protected readonly inProgress = signal(false);
  protected readonly allowFullscreen =
    !!document.fullscreenEnabled || !!(document as any).webkitFullscreenEnabled;
  protected readonly exampleFullscreen = signal(false);
  protected readonly allowCopy = !!navigator.clipboard;
  protected readonly loadReact = signal(false);
  protected readonly loadVue = signal(false);
  protected readonly loadJs = signal(false);
  protected readonly switcherEnabled = this.config.themeSwitcher;
  protected readonly rtlSwitcher = this.config.rtlSwitcher;
  protected readonly rootFontSizes = this.config.rootFontSizes ?? [];
  protected readonly rootFontSize = signal<number | 'initial'>(0);
  protected readonly webcomponents = this.config.webcomponents;
  protected readonly frameworks = new Map([['Angular', 'angular']]);
  protected selectedFramework = localStorage.getItem('si-live-preview-framework') ?? 'angular';

  readonly availableLocales = this.localeApi?.availableLocales() ?? [];

  ticketLinkBug!: string;
  ticketLinkFeature!: string;

  protected readonly editorCollapsed = signal(
    localStorage.getItem('si-live-preview-editor-collapsed') === 'true' && !this.isMobile
  );
  protected readonly showEditor = signal(!this.editorCollapsed());
  protected readonly newMsgs = signal(false);

  private compileSubject = new Subject<string>();

  private templateModified = false;
  private skipInitialLoad = false;
  private flaskTemplate: any;
  private flaskTypescript: any;
  private flaskReactVue: any;
  private savedScrollPos = { top: 0, left: 0 };
  private inProgressCounter = 0;
  private tsLoaded = false;
  private reactLoaded = false;
  private vueLoaded = false;
  private jsLoaded = false;
  private delayClearTimer: any;
  private webcomponentsList: string[] = [];

  constructor() {
    this.compileSubject
      .pipe(throttleTime(500, undefined, { leading: true, trailing: true }))
      .pipe(takeUntilDestroyed())
      .subscribe(template => {
        this.template.set(template);
      });
    this.webcomponentsList = this.config.componentLoader.webcomponentsList;
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    this.activeTab.set(this.activeTab() !== 'typescript' ? 'template' : this.activeTab());
    if (changes.template?.currentValue) {
      this.skipInitialLoad = !!changes.template.isFirstChange;
      this.templateModified = true;
      this.templateReact.set('');
      this.templateVue.set('');
      this.templateJs.set('');
    } else {
      this.skipInitialLoad = !!(
        changes.templateReact?.currentValue ??
        changes.templateVue?.currentValue ??
        changes.templateJs?.currentValue
      );
    }
    if (changes.example?.currentValue) {
      this.loadFromUrl(changes.example.firstChange && this.skipInitialLoad);
      if (this.webcomponents) {
        this.checkWebComponentsAvailable();
      }
    }
    if (this.webcomponents) {
      this.reactLoaded = false;
      this.vueLoaded = false;
      this.jsLoaded = false;
      this.loadReact.set(false);
      this.loadVue.set(false);
      this.loadJs.set(false);
    }
    this.createTicketLinks();
  }

  ngOnInit(): void {
    this.theme.set(localStorage.getItem('si-live-preview-theme') ?? 'light');
    const rfs = localStorage.getItem('si-live-preview-rfs') ?? '';
    this.rootFontSize.set(rfs === 'initial' ? rfs : rfs ? parseInt(rfs, 10) : 0);
  }

  ngAfterViewInit(): void {
    this.flaskTemplate = new CodeFlask(this.templateElem().nativeElement, {
      lineNumbers: true,
      language: 'html',
      defaultTheme: false,
      handleSelfClosingCharacters: false,
      handleTabs: false,
      ariaLabelledby: 'templateEditorTab'
    });

    this.flaskTypescript = new CodeFlask(this.typescriptElem().nativeElement, {
      lineNumbers: true,
      language: 'typescript',
      readonly: true,
      defaultTheme: false,
      handleTabs: false,
      ariaLabelledby: 'typescriptEditorTab'
    });

    this.flaskReactVue = new CodeFlask(this.reactVueElem().nativeElement, {
      lineNumbers: true,
      language: 'typescript',
      readonly: false,
      defaultTheme: false,
      handleTabs: false,
      areaId: 'reactVueEditor'
    });

    this.flaskTemplate.onUpdate((code: string) => {
      if (code !== this.template()) {
        this.templateModified = true;
      }
      this.compileSubject.next(code);
    });

    this.flaskReactVue.onUpdate((code: string) => {
      if (this.activeTab() === 'react') {
        this.templateReact.set(code);
        this.loadReact.set(true);
      } else if (this.activeTab() === 'vue') {
        this.templateVue.set(code);
        this.loadVue.set(true);
      } else if (this.activeTab() === 'js') {
        this.templateJs.set(code);
        this.loadJs.set(true);
      }
    });

    if (this.skipInitialLoad) {
      if (this.templateReact()) {
        this.reactLoaded = true;
        this.changeFramework('react');
      } else if (this.templateVue()) {
        this.vueLoaded = true;
        this.changeFramework('vue');
      } else if (this.templateJs()) {
        this.jsLoaded = true;
        this.changeFramework('js');
      } else {
        this.flaskTemplate.updateCode(this.template());
        this.compileSubject.next(this.template());
      }
      this.skipInitialLoad = false;
    }
  }

  activateTab(tab: string): void {
    this.activeTab.set(tab);

    let saveScroll: ElementRef;
    let restoreScroll: ElementRef;
    this.loadReact.set(false);
    this.loadVue.set(false);
    this.loadJs.set(false);
    if (tab === 'template') {
      saveScroll = this.typescriptElem();
      restoreScroll = this.templateElem();
    } else {
      if (!this.tsLoaded) {
        this.loadTsFromUrl();
      }
      saveScroll = this.templateElem();
      restoreScroll = this.typescriptElem();
    }

    const areaSave = saveScroll.nativeElement.querySelector('textarea');
    const areaRestore = restoreScroll.nativeElement.querySelector('textarea');
    const scrollPos = this.savedScrollPos;
    this.savedScrollPos = { left: areaSave.scrollLeft, top: areaSave.scrollTop };
    setTimeout(() => {
      areaRestore.scrollTop = scrollPos.top;
      areaRestore.scrollLeft = scrollPos.left;
    });
  }

  themeChange(theme: string): void {
    this.theme.set(theme);
    localStorage.setItem('si-live-preview-theme', this.theme());
  }

  private updateTemplate(template: string): void {
    this.templateModified = false;
    this.template.set(template);
    if (this.flaskTemplate) {
      this.flaskTemplate.updateCode(this.template());
    }
  }

  private updateTs(ts: string): void {
    this.templateTs = ts;
    if (this.flaskTypescript) {
      this.flaskTypescript.updateCode(this.templateTs);
    }
  }

  private updateReact(ts: string): void {
    this.templateReact.set(ts);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateReact);
      this.loadReact.set(true);
    }
  }

  private updateVue(ts: string): void {
    this.templateVue.set(ts);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateVue);
      this.loadVue.set(true);
    }
  }

  private updateJs(js: string): void {
    this.templateJs.set(js);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateJs);
      this.loadJs.set(true);
    }
  }

  private loadFromUrl(skipTemplate: boolean): void {
    if (!skipTemplate) {
      this.updateTemplate('');
    }
    this.updateTs('');
    this.savedScrollPos = { top: 0, left: 0 };
    this.inProgressCounter = 0;
    this.inProgress.set(false);
    this.tsLoaded = false;

    if (this.activeTab() === 'typescript') {
      this.loadTsFromUrl();
    }
  }

  private loadTemplateFromUrl(): void {
    const example = this.example();
    if (!example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl() + example + '.html', { responseType: 'text' })
      .pipe(timeout(3000), retry(1))
      .subscribe({
        next: data => {
          this.updateTemplate(data);
          setTimeout(() => {
            this.handleInProgressEvent(false);
          });
        },
        error: () => {
          this.handleInProgressEvent(false);
        }
      });
  }

  private loadTsFromUrl(): void {
    const example = this.example();
    if (!example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl() + example + '.ts', { responseType: 'text' })
      .pipe(timeout(3000), retry(1))
      .subscribe({
        next: data => {
          this.updateTs(data);
          this.tsLoaded = true;
          setTimeout(() => {
            this.handleInProgressEvent(false);
          });
        },
        error: () => {
          this.tsLoaded = true;
          this.handleInProgressEvent(false);
        }
      });
  }

  checkWebComponentsAvailable(): void {
    const baseUrl = this.baseUrl();
    const example = this.example() ?? '';
    if (this.webcomponentsList.includes(baseUrl + example + '-react')) {
      this.frameworks.set('React', 'react');
    } else {
      if (this.selectedFramework === 'react') {
        this.selectedFramework = 'angular';
      }
      this.frameworks.delete('React');
    }
    if (this.webcomponentsList.includes(baseUrl + example + '-vue')) {
      this.frameworks.set('Vue', 'vue');
    } else {
      if (this.selectedFramework === 'vue') {
        this.selectedFramework = 'angular';
      }
      this.frameworks.delete('Vue');
    }
    if (this.webcomponentsList.includes(baseUrl + example + '-js')) {
      this.frameworks.set('Js', 'js');
    } else {
      if (this.selectedFramework === 'js') {
        this.selectedFramework = 'angular';
      }
      this.frameworks.delete('Js');
    }

    this.changeFramework(this.selectedFramework);
  }

  changeFramework(framework: string): void {
    this.activeTab.set(framework);
    localStorage.setItem('si-live-preview-framework', framework);
    this.loadReact.set(false);
    this.loadVue.set(false);
    this.loadJs.set(false);
    let fileType = 'vue';
    if (framework === 'angular') {
      this.activeTab.set('template');
      return;
    } else if (framework === 'react') {
      fileType = 'tsx';
      if (this.reactLoaded) {
        this.updateReact(this.templateReact());
        return;
      }
    } else if (framework === 'vue' && this.vueLoaded) {
      this.updateVue(this.templateVue());
      return;
    } else if (framework === 'js') {
      fileType = 'html';
      if (this.jsLoaded) {
        this.updateJs(this.templateJs());
        return;
      }
    }
    this.handleInProgressEvent(true);
    const baseUrl = this.baseUrl();
    const example = this.example() ?? '';
    this.http
      .get(`${baseUrl}${example}-${framework}.${fileType}`, { responseType: 'text' })
      .subscribe({
        next: (res: any) => {
          if (framework === 'react') {
            this.updateReact(res);
            this.templateReact.set(res);
            this.reactLoaded = true;
          } else if (framework === 'vue') {
            this.updateVue(res);
            this.templateVue.set(res);
            this.vueLoaded = true;
          } else if (framework === 'js') {
            this.updateJs(res);
            this.templateJs.set(res);
            this.jsLoaded = true;
          }
          setTimeout(() => {
            this.handleInProgressEvent(false);
          });
        },
        error: (err: any) => {
          if (framework === 'react') {
            this.updateReact('');
            this.reactLoaded = true;
          } else if (framework === 'vue') {
            this.updateVue('');
            this.vueLoaded = true;
          } else if (framework === 'js') {
            this.updateJs('');
            this.jsLoaded = true;
          }
          this.handleInProgressEvent(false);
        }
      });
  }

  templateFromComponent(template?: string): void {
    if (this.template()) {
      return;
    }
    if (template === undefined) {
      // there's no component loaded in the renderer, load template from url
      this.loadTemplateFromUrl();
    } else {
      // using template from component
      this.updateTemplate(template);
    }
  }

  handleInProgressEvent(inProgress: boolean): void {
    if (inProgress) {
      this.inProgressCounter++;
    } else {
      this.inProgressCounter--;
    }
    this.inProgress.set(!!this.inProgressCounter);
  }

  logClear(delayed = false): void {
    if (delayed && this.logMessages().length) {
      this.delayClearTimer = setTimeout(() => {
        this.delayClearTimer = undefined;
        this.doLogClear();
      }, 100);
      return;
    }
    this.doLogClear();
  }

  private doLogClear(): void {
    if (this.logMessages().length) {
      this.logMessages.set([]);
      setTimeout(() => {
        this.consoleElem().nativeElement.scrollTop = 0;
      });
    }
  }

  logEvent(msg: string): void {
    if (this.delayClearTimer) {
      this.logMessages.set([]);
      clearTimeout(this.delayClearTimer);
      this.delayClearTimer = undefined;
    }
    this.logMessages.set([...this.logMessages(), msg]);
    this.newMsgs.set(true);
    setTimeout(() => {
      this.consoleElem().nativeElement.scrollTop = this.consoleElem().nativeElement.scrollHeight;
    });
  }

  private showCopiedLabel(): void {
    this.showCopied.set(true);
    setTimeout(() => {
      this.showCopied.set(false);
    }, 1500);
  }

  toggleFullscreen(exampleOnly = false): void {
    const fullscreenElement =
      document.fullscreenElement ?? (document as any).webkitFullscreenElement;
    if (fullscreenElement) {
      const exitFunction = document.exitFullscreen ?? (document as any).webkitExitFullscreen;
      if (exitFunction) {
        exitFunction.call(document);
      }
    } else {
      const elem = exampleOnly
        ? this.self.nativeElement.querySelector(':scope > .example')
        : this.self.nativeElement;
      this.exampleFullscreen.set(exampleOnly);
      const requestFunction = elem.requestFullscreen ?? (elem as any).webkitRequestFullScreen;
      if (requestFunction) {
        requestFunction.call(elem);
      }
    }
  }

  toggleCollapse(): void {
    this.editorCollapsed.set(!this.editorCollapsed());
    localStorage.setItem('si-live-preview-editor-collapsed', this.editorCollapsed().toString());

    if (this.editorCollapsed()) {
      this.showEditor.set(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    } else {
      setTimeout(() => {
        this.showEditor.set(true);
        this.newMsgs.set(false);
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }

  toggleRTL(): void {
    this.isRTL.set(!this.isRTL());
  }

  toggleTheme(): void {
    this.themeChange(this.theme() === 'dark' ? 'light' : 'dark');
  }

  localeSelectionChanged(target: EventTarget | null): void {
    const locale = (target as HTMLSelectElement)?.value;
    this.changeLocale(locale);
  }

  rfsSelectionChanges(value: string): void {
    this.rootFontSize.set(value === 'initial' ? value : parseInt(value, 10));
    localStorage.setItem('si-live-preview-rfs', this.rootFontSize().toString());
  }

  changeLocale(locale: string | null | undefined): void {
    this.locale.set(locale);
  }

  copyTemplate(): void {
    this.clipboardCopy(this.template());
  }

  copyCode(): void {
    if (this.activeTab() === 'react') {
      this.clipboardCopy(this.templateReact());
    } else if (this.activeTab() === 'vue') {
      this.clipboardCopy(this.templateVue());
    } else if (this.activeTab() === 'js') {
      this.clipboardCopy(this.templateJs());
    } else {
      this.clipboardCopy(this.templateTs);
    }
  }

  private clipboardCopy(text: string): void {
    navigator.clipboard.writeText(text);
    this.showCopiedLabel();
  }

  createLink(): void {
    const url = this.createTemplateLink('editor');
    this.clipboardCopy(url);
  }

  openTab(): void {
    const url = this.createTemplateLink('viewer');
    window.open(url, '_blank');
  }

  private createTemplateLink(mode: string): string {
    const locale = this.locale();
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += `#/viewer/${mode}?`;
    url += 'theme=' + this.theme();
    if (this.isRTL()) {
      url += '&isRTL=true';
    }
    if (locale) {
      url += '&locale=' + locale;
    }
    if (this.rootFontSize()) {
      url += '&rfs=' + this.rootFontSize();
    }
    if (this.activeTab() === 'react') {
      url += '&t=' + encodeURIComponent(this.templateReact()) + '&framework=react';
    } else if (this.activeTab() === 'vue') {
      url += '&t=' + encodeURIComponent(this.templateVue()) + '&framework=vue';
    } else if (this.activeTab() === 'js') {
      url += '&t=' + encodeURIComponent(this.templateJs()) + '&framework=js';
    } else if (this.templateModified) {
      url += '&t=' + encodeURIComponent(this.template());
    }
    const example = this.example();
    if (example) {
      url += '&e=' + encodeURIComponent(example);
    }
    return url;
  }

  private createTicketLinks(): void {
    const ticketBaseUrl = this.ticketBaseUrl();
    const example = this.example() ?? '';
    this.ticketLinkBug = `${ticketBaseUrl}?issue%5Btitle%5D=%3C${example}%3E:&issuable_template=Bug`;
    this.ticketLinkFeature = `${ticketBaseUrl}?issue%5Btitle%5D=%3C${example}%3E:&issuable_template=Feature Request`;
  }

  protected onFullscreenChange(): void {
    this.isFullscreen.set(
      !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
    );
    if (!this.isFullscreen()) {
      this.exampleFullscreen.set(false);
    }
  }
}
