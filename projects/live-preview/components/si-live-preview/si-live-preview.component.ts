/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
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

@Component({
  selector: 'si-live-preview',
  imports: [KeyValuePipe, FormsModule, SiLivePreviewIframeComponent],
  templateUrl: './si-live-preview.component.html',
  styleUrls: ['./si-live-preview.component.scss', './si-live-preview-codeflask.scss']
})
export class SiLivePreviewComponent implements OnInit, AfterViewInit, OnChanges {
  private config = inject(SI_LIVE_PREVIEW_CONFIG);
  private internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private self = inject(ElementRef);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  public localeApi = inject(SiLivePreviewLocaleApi, { optional: true });

  readonly templateElem = viewChild.required<ElementRef>('codeTemplate');
  readonly typescriptElem = viewChild.required<ElementRef>('codeTypescript');
  readonly reactVueElem = viewChild.required<ElementRef>('codeReactVue');
  readonly consoleElem = viewChild.required<ElementRef>('consoleContainer');

  @Input() baseUrl!: string;
  @Input() example?: string | null;
  @Input() template = '';
  @Input() theme = 'light';
  @Input() locale?: string;
  @Input() isRTL = false;
  @Input() ticketBaseUrl!: string;
  @Input() templateReact = '';
  @Input() templateVue = '';
  @Input() templateJs = '';

  @HostBinding('class.editor-fullscreen') isFullscreen = false;
  @HostBinding('class.is-mobile') isMobile = this.internalConfig.isMobile;

  templateTs = '';
  renderingError: any;
  logMessages: string[] = [];
  activeTab = 'template';
  showCopied = false;
  inProgress = false;
  allowFullscreen = !!document.fullscreenEnabled || !!(document as any).webkitFullscreenEnabled;
  exampleFullscreen = false;
  allowCopy = !!navigator.clipboard;
  loadReact = false;
  loadVue = false;
  loadJs = false;
  switcherEnabled = this.config.themeSwitcher;
  rtlSwitcher = this.config.rtlSwitcher;
  webcomponents = this.config.webcomponents;
  frameworks = new Map([['Angular', 'angular']]);
  selectedFramework = localStorage.getItem('si-live-preview-framework') ?? 'angular';

  availableLocales: string[] = [];

  ticketLinkBug!: string;
  ticketLinkFeature!: string;

  editorCollapsed =
    localStorage.getItem('si-live-preview-editor-collapsed') === 'true' && !this.isMobile;
  showEditor = !this.editorCollapsed;
  newMsgs = false;

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(template => (this.template = template));
    this.webcomponentsList = this.config.componentLoader.webcomponentsList;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.activeTab = this.activeTab !== 'typescript' ? 'template' : this.activeTab;
    if (changes.template?.currentValue) {
      this.skipInitialLoad = !!changes.template.isFirstChange;
      this.templateModified = true;
      this.templateReact = '';
      this.templateVue = '';
      this.templateJs = '';
    } else {
      this.skipInitialLoad =
        changes.templateReact?.currentValue ??
        changes.templateVue?.currentValue ??
        changes.templateJs?.currentValue;
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
      this.loadReact = false;
      this.loadVue = false;
      this.loadJs = false;
    }
    this.createTicketLinks();
  }

  ngOnInit(): void {
    this.availableLocales = this.localeApi?.availableLocales() ?? [];
    this.theme = localStorage.getItem('si-live-preview-theme') ?? 'light';
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
      if (code !== this.template) {
        this.templateModified = true;
      }
      this.compileSubject.next(code);
    });

    this.flaskReactVue.onUpdate((code: string) => {
      if (this.activeTab === 'react') {
        this.templateReact = code;
        this.loadReact = true;
      } else if (this.activeTab === 'vue') {
        this.templateVue = code;
        this.loadVue = true;
      } else if (this.activeTab === 'js') {
        this.templateJs = code;
        this.loadJs = true;
      }
    });

    if (this.skipInitialLoad) {
      if (this.templateReact) {
        this.reactLoaded = true;
        this.changeFramework('react');
      } else if (this.templateVue) {
        this.vueLoaded = true;
        this.changeFramework('vue');
      } else if (this.templateJs) {
        this.jsLoaded = true;
        this.changeFramework('js');
      } else {
        this.flaskTemplate.updateCode(this.template);
        this.compileSubject.next(this.template);
      }
      this.skipInitialLoad = false;
    }
  }

  activateTab(tab: string): void {
    this.activeTab = tab;

    let saveScroll: ElementRef;
    let restoreScroll: ElementRef;
    this.loadReact = false;
    this.loadVue = false;
    this.loadJs = false;
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
    this.theme = theme;
    localStorage.setItem('si-live-preview-theme', this.theme);
  }

  private updateTemplate(template: string): void {
    this.templateModified = false;
    this.template = template;
    if (this.flaskTemplate) {
      this.flaskTemplate.updateCode(this.template);
    }
  }

  private updateTs(ts: string): void {
    this.templateTs = ts;
    if (this.flaskTypescript) {
      this.flaskTypescript.updateCode(this.templateTs);
    }
  }

  private updateReact(ts: string): void {
    this.templateReact = ts;
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateReact);
      this.loadReact = true;
    }
  }

  private updateVue(ts: string): void {
    this.templateVue = ts;
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateVue);
      this.loadVue = true;
    }
  }

  private updateJs(js: string): void {
    this.templateJs = js;
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.templateJs);
      this.loadJs = true;
    }
  }

  private loadFromUrl(skipTemplate: boolean): void {
    if (!skipTemplate) {
      this.updateTemplate('');
    }
    this.updateTs('');
    this.savedScrollPos = { top: 0, left: 0 };
    this.inProgressCounter = 0;
    this.inProgress = false;
    this.tsLoaded = false;

    if (this.activeTab === 'typescript') {
      this.loadTsFromUrl();
    }
  }

  private loadTemplateFromUrl(): void {
    if (!this.example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl + this.example + '.html', { responseType: 'text' })
      .pipe(timeout(3000), retry(1))
      .subscribe({
        next: data => {
          this.updateTemplate(data);
          setTimeout(() => this.handleInProgressEvent(false));
        },
        error: () => this.handleInProgressEvent(false)
      });
  }

  private loadTsFromUrl(): void {
    if (!this.example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl + this.example + '.ts', { responseType: 'text' })
      .pipe(timeout(3000), retry(1))
      .subscribe({
        next: data => {
          this.updateTs(data);
          this.tsLoaded = true;
          setTimeout(() => this.handleInProgressEvent(false));
        },
        error: () => {
          this.tsLoaded = true;
          this.handleInProgressEvent(false);
        }
      });
  }

  checkWebComponentsAvailable(): void {
    if (this.webcomponentsList.includes(this.baseUrl + this.example + '-react')) {
      this.frameworks.set('React', 'react');
    } else {
      if (this.selectedFramework === 'react') {
        this.selectedFramework = 'angular';
      }
      this.frameworks.delete('React');
    }
    if (this.webcomponentsList.includes(this.baseUrl + this.example + '-vue')) {
      this.frameworks.set('Vue', 'vue');
    } else {
      if (this.selectedFramework === 'vue') {
        this.selectedFramework = 'angular';
      }
      this.frameworks.delete('Vue');
    }
    if (this.webcomponentsList.includes(this.baseUrl + this.example + '-js')) {
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
    this.activeTab = framework;
    localStorage.setItem('si-live-preview-framework', framework);
    this.loadReact = false;
    this.loadVue = false;
    this.loadJs = false;
    let fileType = 'vue';
    if (framework === 'angular') {
      this.activeTab = 'template';
      return;
    } else if (framework === 'react') {
      fileType = 'tsx';
      if (this.reactLoaded) {
        this.updateReact(this.templateReact);
        return;
      }
    } else if (framework === 'vue' && this.vueLoaded) {
      this.updateVue(this.templateVue);
      return;
    } else if (framework === 'js') {
      fileType = 'html';
      if (this.jsLoaded) {
        this.updateJs(this.templateJs);
        return;
      }
    }
    this.handleInProgressEvent(true);
    this.http
      .get(`${this.baseUrl}${this.example}-${framework}.${fileType}`, { responseType: 'text' })
      .subscribe({
        next: (res: any) => {
          if (framework === 'react') {
            this.updateReact(res);
            this.reactLoaded = true;
          } else if (framework === 'vue') {
            this.updateVue(res);
            this.vueLoaded = true;
          } else if (framework === 'js') {
            this.updateJs(res);
            this.jsLoaded = true;
          }
          setTimeout(() => this.handleInProgressEvent(false));
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
    if (this.template) {
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
    this.inProgress = !!this.inProgressCounter;
  }

  logClear(delayed = false): void {
    if (delayed && this.logMessages.length) {
      this.delayClearTimer = setTimeout(() => {
        this.delayClearTimer = undefined;
        this.doLogClear();
      }, 100);
      return;
    }
    this.doLogClear();
  }

  private doLogClear(): void {
    if (this.logMessages.length) {
      this.logMessages = [];
      setTimeout(() => {
        this.consoleElem().nativeElement.scrollTop = 0;
      });
    }
  }

  logEvent(msg: string): void {
    if (this.delayClearTimer) {
      this.logMessages = [];
      clearTimeout(this.delayClearTimer);
      this.delayClearTimer = undefined;
    }
    this.logMessages.push(msg);
    this.newMsgs = true;
    setTimeout(() => {
      this.consoleElem().nativeElement.scrollTop = this.consoleElem().nativeElement.scrollHeight;
    });
  }

  private showCopiedLabel(): void {
    this.showCopied = true;
    setTimeout(() => (this.showCopied = false), 1500);
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
      this.exampleFullscreen = exampleOnly;
      const requestFunction = elem.requestFullscreen ?? (elem as any).webkitRequestFullScreen;
      if (requestFunction) {
        requestFunction.call(elem);
      }
    }
  }

  toggleCollapse(): void {
    this.editorCollapsed = !this.editorCollapsed;
    localStorage.setItem('si-live-preview-editor-collapsed', this.editorCollapsed.toString());

    if (this.editorCollapsed) {
      this.showEditor = false;
      setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    } else {
      setTimeout(() => {
        this.showEditor = true;
        this.newMsgs = false;
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }

  toggleRTL(): void {
    this.isRTL = !this.isRTL;
  }

  toggleTheme(): void {
    this.themeChange(this.theme === 'dark' ? 'light' : 'dark');
  }

  localeSelectionChanged(target: EventTarget | null): void {
    const locale = (target as HTMLSelectElement)?.value;
    this.changeLocale(locale);
  }

  changeLocale(locale: string): void {
    this.locale = locale;
  }

  copyTemplate(): void {
    this.clipboardCopy(this.template);
  }

  copyCode(): void {
    if (this.activeTab === 'react') {
      this.clipboardCopy(this.templateReact);
    } else if (this.activeTab === 'vue') {
      this.clipboardCopy(this.templateVue);
    } else if (this.activeTab === 'js') {
      this.clipboardCopy(this.templateJs);
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
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += `#/viewer/${mode}?`;
    url += 'theme=' + this.theme;
    if (this.isRTL) {
      url += '&isRTL=true';
    }
    if (this.locale) {
      url += '&locale=' + this.locale;
    }
    if (this.activeTab === 'react') {
      url += '&t=' + encodeURIComponent(this.templateReact) + '&framework=react';
    } else if (this.activeTab === 'vue') {
      url += '&t=' + encodeURIComponent(this.templateVue) + '&framework=vue';
    } else if (this.activeTab === 'js') {
      url += '&t=' + encodeURIComponent(this.templateJs) + '&framework=js';
    } else if (this.templateModified) {
      url += '&t=' + encodeURIComponent(this.template);
    }
    if (this.example) {
      url += '&e=' + encodeURIComponent(this.example);
    }
    return url;
  }

  private createTicketLinks(): void {
    this.ticketLinkBug = `${this.ticketBaseUrl}?issue%5Btitle%5D=%3C${this.example}%3E:&issuable_template=Bug`;
    this.ticketLinkFeature = `${this.ticketBaseUrl}?issue%5Btitle%5D=%3C${this.example}%3E:&issuable_template=Feature Request`;
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
    if (!this.isFullscreen) {
      this.exampleFullscreen = false;
    }
  }
}
