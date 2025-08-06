/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { SiThemeService } from '@spike-rabbit/element-ng/theme';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { AppComponent as TestComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, SiTranslatePipe, TestComponent],
      providers: [SiThemeService, provideAnimations()]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });
});
