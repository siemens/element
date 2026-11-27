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
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import CodeFlask from 'codeflask';
import { Subject, Subscription } from 'rxjs';
import { finalize, retry, throttleTime, timeout } from 'rxjs/operators';

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
import { LivePreviewUrlService } from '../../services/live-preview-url.service';
import { SiLivePreviewIframeComponent } from '../si-live-preview-iframe/si-live-preview-iframe.component';
import { SiStackblitzButtonDirective } from '../stackblitz/si-stackblitz-button.component';

const PREVIEW_RESIZE_STEP = 24;
const PREVIEW_DRAG_THRESHOLD = 4;

interface SupportingFile {
  path: string;
  name: string;
  language: 'html' | 'typescript';
}

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
  readonly initialTheme = input<ThemeType>();
  /** Initial example height in pixels. When set, the embedded example can be resized. */
  readonly initialPreviewHeight = input<number>();
  private readonly config = inject(SI_LIVE_PREVIEW_CONFIG);
  private readonly internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private readonly self = inject(ElementRef);
  private readonly http = inject(HttpClient);
  private readonly urls = inject(LivePreviewUrlService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly localeApi = inject(SiLivePreviewLocaleApi, { optional: true });
  protected readonly state = inject(LivePreviewStateService);

  protected readonly templateElem = viewChild.required<ElementRef>('codeTemplate');
  protected readonly typescriptElem = viewChild.required<ElementRef>('codeTypescript');
  protected readonly supportingElem = viewChild.required<ElementRef>('codeSupporting');
  protected readonly reactVueElem = viewChild.required<ElementRef>('codeReactVue');
  protected readonly consoleElem = viewChild.required<ElementRef>('consoleContainer');

  protected readonly baseUrl = this.urls.examplesBaseUrl;

  protected readonly isFullscreen = signal(false);
  protected readonly isMobile = this.internalConfig.isMobile;
  protected readonly canResizePreview = computed(
    () => this.initialPreviewHeight() !== undefined && !this.isMobile && !this.isFullscreen()
  );
  protected readonly previewHeight = linkedSignal(() => this.initialPreviewHeight() ?? 204);
  // Keep author-configured heights reachable, even when outside the usual resize range.
  protected readonly minPreviewHeight = computed(() =>
    Math.min(80, this.initialPreviewHeight() ?? 80)
  );
  protected readonly maxPreviewHeight = computed(() =>
    Math.max(1200, this.initialPreviewHeight() ?? 1200)
  );
  protected readonly isResizingPreview = signal(false);
  private previewDrag?: { pointerId: number; pageY: number; height: number; moved: boolean };

  private templateTs = '';
  private supportingFileCode = '';
  private supportingFileLanguage: 'html' | 'typescript' = 'typescript';
  protected readonly supportingFiles = computed<SupportingFile[]>(() => {
    const example = this.state.example();
    if (!example) {
      return [];
    }
    const baseUrl = this.config.examplesBaseUrl;
    const files = this.config.componentLoader.supportingFiles?.[baseUrl + example] ?? [];
    return files.map(file => {
      const relativePath = file.startsWith(baseUrl) ? file.slice(baseUrl.length) : file;
      const name = relativePath.split('/').at(-1) ?? relativePath;
      return {
        path: relativePath,
        name,
        language: relativePath.endsWith('.html') ? 'html' : 'typescript'
      };
    });
  });
  protected readonly selectedSupportingFile = signal('');
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

  private skipInitialLoad = false;
  private flaskTemplate: any;
  private flaskTypescript: any;
  private flaskSupporting: any;
  private flaskReactVue: any;
  private savedScrollPos = new Map<string, { top: number; left: number }>();
  private supportingFileCache = new Map<string, string>();
  private supportingFileLoadSub?: Subscription;
  private tsLoaded = false;
  private reactLoaded = false;
  private vueLoaded = false;
  private jsLoaded = false;
  private webcomponentsList: string[] = [];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.supportingFileLoadSub?.unsubscribe();
    });
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
        const currentTab = this.activeTab();
        if (currentTab === 'other') {
          this.activeTab.set(this.supportingFiles().length ? 'other' : 'template');
        } else if (currentTab !== 'typescript') {
          this.activeTab.set('template');
        }
        this.skipInitialLoad =
          firstLoad &&
          !!(
            this.state.template() ||
            this.state.templateReact() ||
            this.state.templateVue() ||
            this.state.templateJs()
          );
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
      this.initialTheme() ??
        (localStorage.getItem('si-live-preview-theme') === 'dark' ? 'dark' : 'light')
    );
    const rfs = localStorage.getItem('si-live-preview-rfs') ?? '';
    this.state.rootFontSize.set(rfs === 'initial' ? rfs : rfs ? parseInt(rfs, 10) : 0);
  }

  ngAfterViewInit(): void {
    const root = this.self.nativeElement.getRootNode();
    const styleParent = root instanceof ShadowRoot ? root : undefined;
    this.flaskTemplate = new CodeFlask(this.templateElem().nativeElement, {
      styleParent,
      lineNumbers: true,
      language: 'html',
      defaultTheme: false,
      handleSelfClosingCharacters: false,
      handleTabs: false,
      ariaLabelledby: 'templateEditorTab'
    });

    this.flaskTypescript = new CodeFlask(this.typescriptElem().nativeElement, {
      styleParent,
      lineNumbers: true,
      language: 'typescript',
      readonly: true,
      defaultTheme: false,
      handleTabs: false,
      ariaLabelledby: 'typescriptEditorTab'
    });

    this.flaskSupporting = new CodeFlask(this.supportingElem().nativeElement, {
      styleParent,
      lineNumbers: true,
      language: this.supportingFileLanguage,
      readonly: true,
      defaultTheme: false,
      handleTabs: false,
      ariaLabelledby: 'otherFilesEditorTab'
    });
    if (this.supportingFileCode) {
      this.flaskSupporting.updateCode(this.supportingFileCode);
    }

    this.flaskReactVue = new CodeFlask(this.reactVueElem().nativeElement, {
      styleParent,
      lineNumbers: true,
      language: 'typescript',
      readonly: false,
      defaultTheme: false,
      handleTabs: false,
      areaId: 'reactVueEditor'
    });

    this.flaskTemplate.onUpdate((code: string) => {
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

  protected startPreviewResize(event: PointerEvent, handle: HTMLElement): void {
    if (event.button !== 0 || this.previewDrag) {
      return;
    }

    handle.setPointerCapture(event.pointerId);
    this.previewDrag = {
      pointerId: event.pointerId,
      pageY: event.pageY,
      height: this.previewHeight(),
      moved: false
    };
    this.isResizingPreview.set(true);
  }

  protected movePreviewResize(event: PointerEvent): void {
    const drag = this.previewDrag;
    if (drag?.pointerId === event.pointerId) {
      const delta = event.pageY - drag.pageY;
      drag.moved ||= Math.abs(delta) > PREVIEW_DRAG_THRESHOLD;
      if (drag.moved) {
        this.setPreviewHeight(drag.height + delta);
      }
    }
  }

  protected finishPreviewResize(event: PointerEvent, handle: HTMLElement): void {
    const drag = this.previewDrag;
    if (drag?.pointerId !== event.pointerId) {
      return;
    }

    // Keep a single-pointer alternative to dragging on the handle itself.
    if (!drag.moved && Math.abs(event.pageY - drag.pageY) <= PREVIEW_DRAG_THRESHOLD) {
      const { top, bottom, left, right } = handle.getBoundingClientRect();
      const { clientX, clientY } = event;
      if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
        this.stepPreviewHeight(
          clientY < (top + bottom) / 2 ? -PREVIEW_RESIZE_STEP : PREVIEW_RESIZE_STEP
        );
      }
    }
    this.endPreviewResize(event);
  }

  protected endPreviewResize(event: PointerEvent): void {
    if (this.previewDrag?.pointerId === event.pointerId) {
      this.previewDrag = undefined;
      this.isResizingPreview.set(false);
    }
  }

  private stepPreviewHeight(delta: number): void {
    this.setPreviewHeight(this.previewHeight() + delta);
  }

  protected resizePreviewWithKeyboard(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.stepPreviewHeight(-PREVIEW_RESIZE_STEP);
        break;
      case 'ArrowDown':
        this.stepPreviewHeight(PREVIEW_RESIZE_STEP);
        break;
      case 'Home':
        this.setPreviewHeight(this.minPreviewHeight());
        break;
      case 'End':
        this.setPreviewHeight(this.maxPreviewHeight());
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private setPreviewHeight(height: number): void {
    this.previewHeight.set(
      Math.max(this.minPreviewHeight(), Math.min(this.maxPreviewHeight(), height))
    );
  }

  activateTab(tab: string): void {
    const previousTab = this.activeTab();
    this.activeTab.set(tab);

    this.state.loadReact.set(false);
    this.state.loadVue.set(false);
    this.state.loadJs.set(false);
    if (tab === 'typescript' && !this.tsLoaded) {
      this.loadTsFromUrl();
    } else if (tab === 'other') {
      this.loadSelectedSupportingFile();
    }

    const saveElem = this.editorElementForTab(previousTab);
    const restoreElem = this.editorElementForTab(tab);
    const areaSave = saveElem?.nativeElement.querySelector('textarea');
    if (areaSave) {
      this.savedScrollPos.set(previousTab, { left: areaSave.scrollLeft, top: areaSave.scrollTop });
    }
    const areaRestore = restoreElem?.nativeElement.querySelector('textarea');
    const scrollPos = this.savedScrollPos.get(tab) ?? { left: 0, top: 0 };
    if (areaRestore) {
      setTimeout(() => {
        areaRestore.scrollTop = scrollPos.top;
        areaRestore.scrollLeft = scrollPos.left;
      });
    }
  }

  protected selectSupportingFile(path: string): void {
    if (path === this.selectedSupportingFile()) {
      return;
    }
    this.selectedSupportingFile.set(path);
    this.savedScrollPos.set('other', { left: 0, top: 0 });
    const textarea = this.supportingElem().nativeElement.querySelector('textarea');
    if (textarea) {
      textarea.scrollTop = 0;
      textarea.scrollLeft = 0;
    }
    this.loadSelectedSupportingFile();
  }

  private editorElementForTab(tab: string): ElementRef | undefined {
    if (tab === 'template') {
      return this.templateElem();
    }
    if (tab === 'typescript') {
      return this.typescriptElem();
    }
    if (tab === 'other') {
      return this.supportingElem();
    }
    return undefined;
  }

  themeChange(theme: ThemeType): void {
    this.state.theme.set(theme);
    localStorage.setItem('si-live-preview-theme', this.state.theme());
  }

  private updateTemplate(template: string): void {
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

  private updateSupportingFile(code: string, language: 'html' | 'typescript'): void {
    this.supportingFileCode = code;
    this.supportingFileLanguage = language;
    if (this.flaskSupporting) {
      this.flaskSupporting.updateLanguage(language);
      this.flaskSupporting.updateCode(this.supportingFileCode);
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
    this.supportingFileLoadSub?.unsubscribe();
    this.supportingFileLoadSub = undefined;
    this.supportingFileCache.clear();
    const firstSupporting = this.supportingFiles()[0];
    this.selectedSupportingFile.set(firstSupporting?.path ?? '');
    this.updateSupportingFile('', firstSupporting?.language ?? 'typescript');
    this.savedScrollPos.clear();
    this.state.resetRenderingProgress();
    this.tsLoaded = false;

    if (this.activeTab() === 'typescript') {
      this.loadTsFromUrl();
    } else if (this.activeTab() === 'other') {
      this.loadSelectedSupportingFile();
    }
  }

  private loadTemplateFromUrl(): void {
    const example = this.state.example();
    if (!example) {
      return;
    }
    this.handleInProgressEvent(true);
    this.http
      .get(this.urls.sourceUrl(example + '.html'), { responseType: 'text' })
      .pipe(timeout(3000), retry(1))
      .subscribe({
        next: data => {
          this.state.originalTemplate.set(data);
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
      .get(this.urls.sourceUrl(example + '.ts'), { responseType: 'text' })
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

  private loadSelectedSupportingFile(): void {
    const selectedPath = this.selectedSupportingFile();
    const file = this.supportingFiles().find(item => item.path === selectedPath);
    if (!file) {
      this.updateSupportingFile('', 'typescript');
      return;
    }

    const cached = this.supportingFileCache.get(file.path);
    if (cached !== undefined) {
      this.supportingFileLoadSub?.unsubscribe();
      this.supportingFileLoadSub = undefined;
      this.updateSupportingFile(cached, file.language);
      return;
    }

    this.supportingFileLoadSub?.unsubscribe();
    this.updateSupportingFile('', file.language);
    this.handleInProgressEvent(true);
    this.supportingFileLoadSub = this.http
      .get(this.urls.sourceUrl(file.path), { responseType: 'text' })
      .pipe(
        timeout(3000),
        retry(1),
        finalize(() => this.handleInProgressEvent(false))
      )
      .subscribe({
        next: data => {
          this.supportingFileCache.set(file.path, data);
          if (this.selectedSupportingFile() === file.path) {
            this.updateSupportingFile(data, file.language);
          }
        },
        error: () => {
          if (this.selectedSupportingFile() === file.path) {
            this.updateSupportingFile('', file.language);
          }
        }
      });
  }

  checkWebComponentsAvailable(): void {
    const baseUrl = this.config.examplesBaseUrl;
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
    const previousTab = this.activeTab();
    this.state.framework.set(framework);
    localStorage.setItem('si-live-preview-framework', framework);
    this.state.loadReact.set(false);
    this.state.loadVue.set(false);
    this.state.loadJs.set(false);
    let fileType = 'vue';
    if (framework === 'angular') {
      if (previousTab !== 'template' && previousTab !== 'typescript' && previousTab !== 'other') {
        this.activeTab.set('template');
      }
      return;
    }
    this.activeTab.set(framework);
    if (framework === 'react') {
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
    const example = this.state.example() ?? '';
    this.http
      .get(this.urls.sourceUrl(`${example}-${framework}.${fileType}`), { responseType: 'text' })
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
    const fullscreenElement = this.getFullscreenElement();
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
    } else if (this.activeTab() === 'other') {
      this.clipboardCopy(this.supportingFileCode);
    } else {
      this.clipboardCopy(this.templateTs);
    }
  }

  private clipboardCopy(text: string): void {
    navigator.clipboard.writeText(text);
    this.showCopiedLabel();
  }

  createLink(): void {
    this.clipboardCopy(this.urls.viewerUrl('editor'));
  }

  openTab(): void {
    window.open(this.urls.viewerUrl('viewer'), '_blank');
  }

  protected onFullscreenChange(): void {
    const fullscreenElement = this.getFullscreenElement();
    this.isFullscreen.set(
      !!fullscreenElement && this.self.nativeElement.contains(fullscreenElement)
    );
    if (!this.isFullscreen()) {
      this.exampleFullscreen.set(false);
    }
  }

  private getFullscreenElement(): Element | null {
    const root: Document | ShadowRoot = this.self.nativeElement.getRootNode();
    return (
      root.fullscreenElement ??
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ??
      null
    );
  }
}
