/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCopyrightDetails } from '@siemens/element-ng/copyright-notice';

import { SiCopyrightNoticeComponent } from './si-copyright-notice.component';

@Component({
  imports: [SiCopyrightNoticeComponent],
  template: `<si-copyright-notice />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {}
describe('SiCopyrightNoticeComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        provideCopyrightDetails({
          company: 'Sample Company',
          startYear: 2012,
          lastUpdateYear: 2019
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should fetch from injector and assign default company', () => {
    fixture.detectChanges();
    const copyrightElement = element.querySelector<HTMLElement>('si-copyright-notice');
    expect(copyrightElement).toBeTruthy();

    expect(copyrightElement?.innerText).toContain('Sample Company');
    expect(copyrightElement?.innerText).toContain('2012');
    expect(copyrightElement?.innerText).toContain('-');
  });

  it('should print the correct last updated year when globally injected', () => {
    fixture.detectChanges();
    const copyrightEl = element.querySelector<HTMLElement>('si-copyright-notice');
    expect(copyrightEl).toBeTruthy();

    expect(copyrightEl?.innerText).toContain('-');
    expect(copyrightEl?.innerText).toContain('2019');
  });
});
