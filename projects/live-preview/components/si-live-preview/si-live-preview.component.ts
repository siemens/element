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
  effect,
  inject,
  OnInit,
  signal,
  untracked,
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

import { SiLivePreviewLocaleApi, ThemeType } from '../../interfaces/si-live-preview.api';
import {
  LivePreviewFramework,
  LivePreviewStateService
} from '../../services/live-preview-state.service';
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
export class SiLivePreviewComponent implements OnInit, AfterViewInit {
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly self = inject(ElementRef);
  private readonly http = inject(HttpClient);
  protected readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  protected readonly state = inject(LivePreviewStateService);

  protected readonly templateElem = viewChild.required<ElementRef>('codeTemplate');
  protected readonly typescriptElem = viewChild.required<ElementRef>('codeTypescript');
  protected readonly reactVueElem = viewChild.required<ElementRef>('codeReactVue');
  protected readonly consoleElem = viewChild.required<ElementRef>('consoleContainer');

  protected readonly baseUrl = this.config.examplesBaseUrl;

  protected readonly isFullscreen = signal(false);
  protected readonly isMobile = this.internalConfig.isMobile;

  private templateTs = '';
  protected readonly activeTab = signal<string>('template');
  protected readonly showCopied = signal(false);
  protected readonly allowFullscreen =
    !!document.fullscreenEnabled || !!(document as any).webkitFullscreenEnabled;
  protected readonly exampleFullscreen = signal(false);
  protected readonly allowCopy = !!navigator.clipboard;
  protected readonly switcherEnabled = this.config.themeSwitcher;
  protected readonly rtlSwitcher = this.config.rtlSwitcher;
  protected readonly rootFontSizes = this.config.rootFontSizes ?? [];
  protected readonly webcomponents = this.config.webcomponents;
  protected readonly frameworks = new Map<string, LivePreviewFramework>([['Angular', 'angular']]);

  readonly availableLocales = this.localeApi?.availableLocales() ?? [];

  protected readonly editorCollapsed = signal(
    localStorage.getItem('si-live-preview-editor-collapsed') === 'true' && !this.isMobile
  );
  protected readonly showEditor = signal(!this.editorCollapsed());

  private compileSubject = new Subject<string>();

  private templateModified = false;
  private skipInitialLoad = false;
  private flaskTemplate: any;
  private flaskTypescript: any;
  private flaskReactVue: any;
  private savedScrollPos = { top: 0, left: 0 };
  private tsLoaded = false;
  private reactLoaded = false;
  private vueLoaded = false;
  private jsLoaded = false;
  private webcomponentsList: string[] = [];

  constructor() {
    const storedFramework = localStorage.getItem('si-live-preview-framework');
    if (storedFramework === 'react' || storedFramework === 'vue' || storedFramework === 'js') {
      this.state.framework.set(storedFramework);
    }
    this.compileSubject
      .pipe(throttleTime(500, undefined, { leading: true, trailing: true }))
      .pipe(takeUntilDestroyed())
      .subscribe(template => {
        this.state.template.set(template);
      });
    this.webcomponentsList = this.config.componentLoader.webcomponentsList;
    let previousExample: string | undefined;
    effect(() => {
      const example = this.state.example();
      if (!example || example === previousExample) {
        return;
      }
      const firstLoad = previousExample === undefined;
      previousExample = example;
      untracked(() => {
        this.activeTab.set(this.activeTab() !== 'typescript' ? 'template' : this.activeTab());
        this.skipInitialLoad =
          firstLoad &&
          !!(
            this.state.template() ||
            this.state.templateReact() ||
            this.state.templateVue() ||
            this.state.templateJs()
          );
        this.templateModified = !!this.state.template();
        this.loadFromUrl(this.skipInitialLoad);
        if (this.webcomponents) {
          this.reactLoaded = false;
          this.vueLoaded = false;
          this.jsLoaded = false;
          this.state.stopWebComponentLoading();
          this.checkWebComponentsAvailable();
        }
      });
    });
    effect(() => localStorage.setItem('si-live-preview-theme', this.state.theme()));
    effect(() => {
      if (this.state.logMessages().length) {
        setTimeout(() => {
          this.consoleElem().nativeElement.scrollTop =
            this.consoleElem().nativeElement.scrollHeight;
        });
      }
    });
  }

  ngOnInit(): void {
    this.state.theme.set(
      localStorage.getItem('si-live-preview-theme') === 'dark' ? 'dark' : 'light'
    );
    const rfs = localStorage.getItem('si-live-preview-rfs') ?? '';
    this.state.rootFontSize.set(rfs === 'initial' ? rfs : rfs ? parseInt(rfs, 10) : 0);
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
      if (code !== this.state.template()) {
        this.templateModified = true;
      }
      this.compileSubject.next(code);
    });

    this.flaskReactVue.onUpdate((code: string) => {
      if (this.activeTab() === 'react') {
        this.state.templateReact.set(code);
        this.state.loadReact.set(true);
      } else if (this.activeTab() === 'vue') {
        this.state.templateVue.set(code);
        this.state.loadVue.set(true);
      } else if (this.activeTab() === 'js') {
        this.state.templateJs.set(code);
        this.state.loadJs.set(true);
      }
    });

    if (this.skipInitialLoad) {
      if (this.state.templateReact()) {
        this.reactLoaded = true;
        this.changeFramework('react');
      } else if (this.state.templateVue()) {
        this.vueLoaded = true;
        this.changeFramework('vue');
      } else if (this.state.templateJs()) {
        this.jsLoaded = true;
        this.changeFramework('js');
      } else {
        this.flaskTemplate.updateCode(this.state.template());
        this.compileSubject.next(this.state.template());
      }
      this.skipInitialLoad = false;
    }
  }

  activateTab(tab: string): void {
    this.activeTab.set(tab);

    let saveScroll: ElementRef;
    let restoreScroll: ElementRef;
    this.state.loadReact.set(false);
    this.state.loadVue.set(false);
    this.state.loadJs.set(false);
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

  themeChange(theme: ThemeType): void {
    this.state.theme.set(theme);
    localStorage.setItem('si-live-preview-theme', this.state.theme());
  }

  private updateTemplate(template: string): void {
    this.templateModified = false;
    this.state.template.set(template);
    if (this.flaskTemplate) {
      this.flaskTemplate.updateCode(this.state.template());
    }
  }

  private updateTs(ts: string): void {
    this.templateTs = ts;
    if (this.flaskTypescript) {
      this.flaskTypescript.updateCode(this.templateTs);
    }
  }

  private updateReact(ts: string): void {
    this.state.templateReact.set(ts);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.state.templateReact());
      this.state.loadReact.set(true);
    }
  }

  private updateVue(ts: string): void {
    this.state.templateVue.set(ts);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.state.templateVue());
      this.state.loadVue.set(true);
    }
  }

  private updateJs(js: string): void {
    this.state.templateJs.set(js);
    if (this.flaskReactVue) {
      this.flaskReactVue.updateCode(this.state.templateJs());
      this.state.loadJs.set(true);
    }
  }

  private loadFromUrl(skipTemplate: boolean): void {
    if (!skipTemplate) {
      this.updateTemplate('');
    }
    this.updateTs('');
    this.savedScrollPos = { top: 0, left: 0 };
    this.state.resetRenderingProgress();
    this.tsLoaded = false;

    if (this.activeTab() === 'typescript') {
      this.loadTsFromUrl();
    }
  }

  private loadTemplateFromUrl(): void {
    const example = this.state.example();
    if (!example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl + example + '.html', { responseType: 'text' })
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
    const example = this.state.example();
    if (!example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.baseUrl + example + '.ts', { responseType: 'text' })
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
    const baseUrl = this.baseUrl;
    const example = this.state.example() ?? '';
    if (this.webcomponentsList.includes(baseUrl + example + '-react')) {
      this.frameworks.set('React', 'react');
    } else {
      if (this.state.framework() === 'react') {
        this.state.framework.set('angular');
      }
      this.frameworks.delete('React');
    }
    if (this.webcomponentsList.includes(baseUrl + example + '-vue')) {
      this.frameworks.set('Vue', 'vue');
    } else {
      if (this.state.framework() === 'vue') {
        this.state.framework.set('angular');
      }
      this.frameworks.delete('Vue');
    }
    if (this.webcomponentsList.includes(baseUrl + example + '-js')) {
      this.frameworks.set('Js', 'js');
    } else {
      if (this.state.framework() === 'js') {
        this.state.framework.set('angular');
      }
      this.frameworks.delete('Js');
    }

    this.changeFramework(this.state.framework());
  }

  changeFramework(framework: LivePreviewFramework): void {
    this.activeTab.set(framework);
    this.state.framework.set(framework);
    localStorage.setItem('si-live-preview-framework', framework);
    this.state.loadReact.set(false);
    this.state.loadVue.set(false);
    this.state.loadJs.set(false);
    let fileType = 'vue';
    if (framework === 'angular') {
      this.activeTab.set('template');
      return;
    } else if (framework === 'react') {
      fileType = 'tsx';
      if (this.reactLoaded) {
        this.updateReact(this.state.templateReact());
        return;
      }
    } else if (framework === 'vue' && this.vueLoaded) {
      this.updateVue(this.state.templateVue());
      return;
    } else if (framework === 'js') {
      fileType = 'html';
      if (this.jsLoaded) {
        this.updateJs(this.state.templateJs());
        return;
      }
    }
    this.handleInProgressEvent(true);
    const baseUrl = this.baseUrl;
    const example = this.state.example() ?? '';
    this.http
      .get(`${baseUrl}${example}-${framework}.${fileType}`, { responseType: 'text' })
      .subscribe({
        next: (res: any) => {
          if (framework === 'react') {
            this.updateReact(res);
            this.state.templateReact.set(res);
            this.reactLoaded = true;
          } else if (framework === 'vue') {
            this.updateVue(res);
            this.state.templateVue.set(res);
            this.vueLoaded = true;
          } else if (framework === 'js') {
            this.updateJs(res);
            this.state.templateJs.set(res);
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
    if (this.state.template()) {
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
    this.state.setRenderingProgress(inProgress);
  }

  logClear(delayed = false): void {
    if (this.state.logMessages().length) {
      this.state.clearLogs(delayed);
      setTimeout(
        () => {
          this.consoleElem().nativeElement.scrollTop = 0;
        },
        delayed ? 100 : 0
      );
    }
  }

  logEvent(msg: string): void {
    this.state.addLog(msg);
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
        this.state.newMessages.set(false);
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }

  toggleRTL(): void {
    this.state.isRTL.set(!this.state.isRTL());
  }

  toggleTheme(): void {
    this.themeChange(this.state.theme() === 'dark' ? 'light' : 'dark');
  }

  localeSelectionChanged(target: EventTarget | null): void {
    const locale = (target as HTMLSelectElement)?.value;
    this.changeLocale(locale);
  }

  rfsSelectionChanges(value: string): void {
    this.state.rootFontSize.set(value === 'initial' ? value : parseInt(value, 10));
    localStorage.setItem('si-live-preview-rfs', this.state.rootFontSize().toString());
  }

  changeLocale(locale: string | null | undefined): void {
    this.state.locale.set(locale ?? undefined);
  }

  protected renderingErrorMessage(): string {
    return String(this.state.renderingError());
  }

  copyTemplate(): void {
    this.clipboardCopy(this.state.template());
  }

  copyCode(): void {
    if (this.activeTab() === 'react') {
      this.clipboardCopy(this.state.templateReact());
    } else if (this.activeTab() === 'vue') {
      this.clipboardCopy(this.state.templateVue());
    } else if (this.activeTab() === 'js') {
      this.clipboardCopy(this.state.templateJs());
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
    const locale = this.state.locale();
    let url = `${window.location.protocol}//${window.location.host}`;
    url += window.location.pathname;
    url += `#/viewer/${mode}?`;
    url += 'theme=' + this.state.theme();
    if (this.state.isRTL()) {
      url += '&isRTL=true';
    }
    if (locale) {
      url += '&locale=' + locale;
    }
    if (this.state.rootFontSize()) {
      url += '&rfs=' + this.state.rootFontSize();
    }
    if (this.activeTab() === 'react') {
      url += '&t=' + encodeURIComponent(this.state.templateReact()) + '&framework=react';
    } else if (this.activeTab() === 'vue') {
      url += '&t=' + encodeURIComponent(this.state.templateVue()) + '&framework=vue';
    } else if (this.activeTab() === 'js') {
      url += '&t=' + encodeURIComponent(this.state.templateJs()) + '&framework=js';
    } else if (this.templateModified) {
      url += '&t=' + encodeURIComponent(this.state.template());
    }
    const example = this.state.example();
    if (example) {
      url += '&e=' + encodeURIComponent(example);
    }
    return url;
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
