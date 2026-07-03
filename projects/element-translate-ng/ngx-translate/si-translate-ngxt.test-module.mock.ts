/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// eslint-disable-next-line no-restricted-imports
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { of } from 'rxjs';

@Component({
  imports: [TranslatePipe],
  template: `{{ 'KEY-1' | translate }}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {}

@NgModule({
  imports: [
    TranslateModule.forChild({
      defaultLanguage: 'test',
      useDefaultLang: true,
      loader: {
        provide: TranslateLoader,
        useValue: { getTranslation: () => of({ 'KEY-1': 'VALUE-MODIFIED' }) } as TranslateLoader
      },
      isolate: true
    }),
    RouterModule.forChild([{ path: '', component: TestComponent, pathMatch: 'full' }]),
    TestComponent
  ]
})
export class TestModule {}
