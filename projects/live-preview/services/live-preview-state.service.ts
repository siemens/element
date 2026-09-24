/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, effect, inject, Service, signal } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import type { LivePreviewViewport } from '../components/si-live-preview-iframe/live-preview-mode';
import { ThemeType } from '../interfaces/si-live-preview.api';

export type LivePreviewFramework = 'angular' | 'react' | 'vue' | 'js';

export interface LivePreviewRenderRequest extends LivePreviewViewport {
  exampleUrl: string;
  template: string;
  loadReact: boolean;
  loadVue: boolean;
  loadJs: boolean;
  reactVueTemplate: string;
}

@Service()
export class LivePreviewStateService {
  private readonly router = inject(Router);
  private readonly overviewExample = computed(() => {
    this.router.lastSuccessfulNavigation();
    const route = this.findOverviewRoute(this.router.routerState.root);
    return this.getOverviewExample(route?.snapshot.url ?? []);
  });
  private delayedLogClearTimer?: ReturnType<typeof setTimeout>;

  readonly example = signal('');
  readonly dataId = signal('');
  readonly template = signal('');
  readonly templateReact = signal('');
  readonly templateVue = signal('');
  readonly templateJs = signal('');
  readonly originalTemplate = signal('');

  readonly theme = signal<ThemeType>('light');
  readonly locale = signal<string | undefined>(undefined);
  readonly isRTL = signal(false);
  readonly rootFontSize = signal<number | 'initial'>(0);

  readonly framework = signal<LivePreviewFramework>('angular');
  readonly loadReact = signal(false);
  readonly loadVue = signal(false);
  readonly loadJs = signal(false);

  readonly supportsLandscape = signal(false);
  readonly viewport = signal<LivePreviewViewport>({ mode: 'ios' });
  readonly iFrameHeight = signal<string | undefined>(undefined);
  readonly iFrameWidth = signal<string | undefined>(undefined);

  readonly renderingError = signal<unknown>(undefined);
  readonly logMessages = signal<string[]>([]);
  readonly newMessages = signal(false);
  readonly pendingOperations = signal(0);
  readonly inProgress = computed(() => this.pendingOperations() > 0);

  readonly templateModified = computed(() => this.originalTemplate() !== this.template());
  readonly activeWebComponentTemplate = computed(() => {
    switch (this.framework()) {
      case 'react':
        return this.templateReact();
      case 'vue':
        return this.templateVue();
      case 'js':
        return this.templateJs();
      default:
        return '';
    }
  });

  constructor() {
    effect(() => {
      const example = this.overviewExample();
      if (example !== undefined) {
        this.clearTemplates();
        this.example.set(example);
      }
    });
  }

  private findOverviewRoute(route: ActivatedRoute): ActivatedRoute | undefined {
    if (route.routeConfig?.path === 'overview') {
      let activeRoute = route;
      while (activeRoute.firstChild) {
        activeRoute = activeRoute.firstChild;
      }
      return activeRoute;
    }

    for (const child of route.children) {
      const overviewRoute = this.findOverviewRoute(child);
      if (overviewRoute) {
        return overviewRoute;
      }
    }
    return undefined;
  }

  private getOverviewExample(segments: UrlSegment[]): string | undefined {
    return segments.length ? segments.join('/') : undefined;
  }

  setFramework(framework: LivePreviewFramework): void {
    this.framework.set(framework);
    this.loadReact.set(framework === 'react');
    this.loadVue.set(framework === 'vue');
    this.loadJs.set(framework === 'js');
  }

  applyRenderRequest(request: LivePreviewRenderRequest): void {
    this.example.set(request.exampleUrl);
    this.template.set(request.template);
    this.loadReact.set(request.loadReact);
    this.loadVue.set(request.loadVue);
    this.loadJs.set(request.loadJs);

    if (request.loadReact) {
      this.framework.set('react');
      this.templateReact.set(request.reactVueTemplate);
    } else if (request.loadVue) {
      this.framework.set('vue');
      this.templateVue.set(request.reactVueTemplate);
    } else if (request.loadJs) {
      this.framework.set('js');
      this.templateJs.set(request.reactVueTemplate);
    } else {
      this.framework.set('angular');
    }

    this.viewport.set({
      mode: request.mode,
      safeAreaTop: request.safeAreaTop,
      safeAreaBottom: request.safeAreaBottom,
      safeAreaLeft: request.safeAreaLeft,
      safeAreaRight: request.safeAreaRight
    });
  }

  stopWebComponentLoading(): void {
    this.loadReact.set(false);
    this.loadVue.set(false);
    this.loadJs.set(false);
  }

  clearTemplates(): void {
    this.template.set('');
    this.templateReact.set('');
    this.templateVue.set('');
    this.templateJs.set('');
    this.originalTemplate.set('');
  }

  toggleTheme(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }

  setRenderingProgress(inProgress: boolean): void {
    this.pendingOperations.update(count => Math.max(0, count + (inProgress ? 1 : -1)));
  }

  resetRenderingProgress(): void {
    this.pendingOperations.set(0);
  }

  addLog(message: string): void {
    if (this.delayedLogClearTimer) {
      clearTimeout(this.delayedLogClearTimer);
      this.delayedLogClearTimer = undefined;
      this.logMessages.set([]);
    }
    this.logMessages.update(messages => [...messages, message]);
    this.newMessages.set(true);
  }

  clearLogs(delayed = false): void {
    if (delayed && this.logMessages().length) {
      this.delayedLogClearTimer = setTimeout(() => {
        this.delayedLogClearTimer = undefined;
        this.logMessages.set([]);
      }, 100);
      return;
    }
    this.logMessages.set([]);
  }
}
