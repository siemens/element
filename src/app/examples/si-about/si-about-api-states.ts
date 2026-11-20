/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Component, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { form, FormField, max, min } from '@angular/forms/signals';
import { ApiInfo, SiAboutComponent } from '@siemens/element-ng/about';
import { Observable } from 'rxjs';

type MockState = 'loaded' | 'loading' | 'error' | 'empty';

interface ApiStateSettings {
  indexState: MockState;
  categoryState: MockState;
  textState: MockState;
  delayMs: number;
  succeedOnRetry: boolean;
}

const MOCK_INDEX: ApiInfo[] = [
  { name: 'OS', href: 'mock-licenses/os/components.json' },
  { name: 'Application', href: 'mock-licenses/application/components.json' }
];

const MOCK_CATEGORIES: Record<string, ApiInfo[]> = {
  'mock-licenses/os/components.json': [
    { name: 'Example Lib Three 2.0.3', href: 'mock-licenses/os/example-3.txt' },
    { name: 'Example Lib Four 1.3.7', href: 'mock-licenses/os/example-4.txt' }
  ],
  'mock-licenses/application/components.json': [
    { name: 'Example Lib One 1.0.0', href: 'mock-licenses/application/example-1.txt' },
    { name: 'Example Lib Two 1.2.4', href: 'mock-licenses/application/example-2.txt' }
  ]
};

const MOCK_LICENSE_TEXT = `Example Software License - Version 1.0

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the software.`;

@Injectable()
class MockLicenseApiService {
  readonly settings = signal<ApiStateSettings>({
    indexState: 'loaded',
    categoryState: 'loaded',
    textState: 'loaded',
    delayMs: 800,
    succeedOnRetry: true
  });

  private readonly attempts = new Map<string, number>();

  resetAttempts(): void {
    this.attempts.clear();
  }

  handle(req: HttpRequest<unknown>, fallback: HttpBackend): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith('mock-licenses/')) {
      return fallback.handle(req);
    }

    const currentSettings = this.settings();
    const attempt = (this.attempts.get(req.url) ?? 0) + 1;
    this.attempts.set(req.url, attempt);

    const level = this.resolveLevel(req.url);
    const configuredState = this.getStateForLevel(level, currentSettings);
    const effectiveState: MockState =
      configuredState === 'error' && currentSettings.succeedOnRetry && attempt > 1
        ? 'loaded'
        : configuredState;

    if (effectiveState === 'loading') {
      return new Observable();
    }

    return new Observable(observer => {
      const timer = setTimeout(() => {
        if (effectiveState === 'error') {
          observer.error(
            new HttpErrorResponse({
              url: req.url,
              status: 500,
              statusText: 'Internal Server Error'
            })
          );
          return;
        }

        const body = this.getResponseBody(req.url, level, effectiveState === 'empty');
        observer.next(new HttpResponse({ status: 200, url: req.url, body }));
        observer.complete();
      }, currentSettings.delayMs);

      return () => clearTimeout(timer);
    });
  }

  private resolveLevel(url: string): 'index' | 'category' | 'text' {
    if (url === 'mock-licenses/licenses.json') {
      return 'index';
    }
    if (url.endsWith('.json')) {
      return 'category';
    }
    return 'text';
  }

  private getStateForLevel(
    level: 'index' | 'category' | 'text',
    settings: ApiStateSettings
  ): MockState {
    switch (level) {
      case 'index':
        return settings.indexState;
      case 'category':
        return settings.categoryState;
      case 'text':
        return settings.textState;
    }
  }

  private getResponseBody(
    url: string,
    level: 'index' | 'category' | 'text',
    empty: boolean
  ): ApiInfo[] | string {
    if (level === 'index') {
      return empty ? [] : MOCK_INDEX.map(item => ({ ...item }));
    }
    if (level === 'category') {
      return empty ? [] : (MOCK_CATEGORIES[url] ?? []).map(item => ({ ...item }));
    }
    return empty ? '' : MOCK_LICENSE_TEXT;
  }
}

@Component({
  selector: 'app-sample',
  imports: [FormField, SiAboutComponent],
  templateUrl: './si-about-api-states.html',
  providers: [
    MockLicenseApiService,
    {
      provide: HttpClient,
      useFactory: () => {
        const backend = inject(HttpBackend);
        const mockApi = inject(MockLicenseApiService);
        return new HttpClient({ handle: req => mockApi.handle(req, backend) });
      }
    }
  ]
})
export class SampleComponent {
  private readonly mockApi = inject(MockLicenseApiService);

  protected readonly settings = this.mockApi.settings;
  protected readonly settingsForm = form(this.settings, path => {
    min(path.delayMs, 0);
    max(path.delayMs, 3000);
  });
  protected readonly reloadVersion = signal(0);

  private previousIndexState: MockState = this.settings().indexState;

  constructor() {
    effect(() => {
      const indexState = this.settings().indexState;
      if (indexState !== this.previousIndexState) {
        this.previousIndexState = indexState;
        untracked(() => this.reload());
      }
    });
  }

  protected reload(): void {
    this.mockApi.resetAttempts();
    this.reloadVersion.update(version => version + 1);
  }
}
