/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// eslint-disable-next-line no-restricted-imports
import { provideChildTranslateService, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { of } from 'rxjs';

@Component({
  imports: [TranslatePipe],
  template: `{{ 'KEY-1' | translate }}`
})
class TestComponent {}

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: TestComponent, pathMatch: 'full' }]),
    TestComponent
  ],
  providers: [
    provideChildTranslateService({
      loader: {
        provide: TranslateLoader,
        useValue: { getTranslation: () => of({ 'KEY-1': 'VALUE-MODIFIED' }) } as TranslateLoader
      }
    })
  ]
})
export class TestModule {}
