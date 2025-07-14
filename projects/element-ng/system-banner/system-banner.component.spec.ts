/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiSystemBannerComponent } from './system-banner.component';

describe('SiSystemBannerComponent', () => {
  let component: SiSystemBannerComponent;
  let fixture: ComponentFixture<SiSystemBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiSystemBannerComponent, NgClass, SiTranslateModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiSystemBannerComponent);
    fixture.componentRef.setInput('message', 'Test');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display meesage', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('Test');
  });

  it('should have default banner type', () => {
    expect(component.status()).toBe('info');
  });

  it('should have class based on banner type', () => {
    expect(fixture.nativeElement.classList).toContain('banner-info');
    fixture.componentRef.setInput('status', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('banner-success');
  });
});
