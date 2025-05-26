/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyrightDetails, SI_COPYRIGHT_DETAILS } from '@siemens/element-ng/copyright-notice';

import { SiCopyrightNoticeComponent } from './si-copyright-notice.component';

@Component({
  template: `<si-copyright-notice />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiCopyrightNoticeComponent]
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
        {
          provide: SI_COPYRIGHT_DETAILS,
          useValue: {
            startYear: 2012,
            lastUpdateYear: 2019
          }
        }
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

@Component({
  template: `<si-copyright-notice [copyright]="copyrightInfo" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiCopyrightNoticeComponent]
})
class WrapperWithInputComponent {
  copyrightInfo: CopyrightDetails | undefined = {
    startYear: 2020,
    company: 'My Company',
    lastUpdateYear: 2021
  };
}
describe('SiCopyrightNoticeComponentWithInput', () => {
  let component: WrapperWithInputComponent;
  let fixture: ComponentFixture<WrapperWithInputComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperWithInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperWithInputComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should initialize component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should reflect input changes', () => {
    fixture.detectChanges();
    const copyrightEl = element.querySelector<HTMLElement>('si-copyright-notice');
    expect(copyrightEl).toBeTruthy();

    expect(copyrightEl?.innerText).toContain('My Company');
    expect(copyrightEl?.innerText).toContain('2020');
    expect(copyrightEl?.innerText).toContain('-');
  });

  it('should print the correct last updated year', () => {
    fixture.detectChanges();
    const copyrightEl = element.querySelector<HTMLElement>('si-copyright-notice');
    expect(copyrightEl).toBeTruthy();

    expect(copyrightEl?.innerText).toContain('-');
    expect(copyrightEl?.innerText).toContain('2021');
  });

  it('should print default copyright notice when no input is given', () => {
    component.copyrightInfo = undefined;
    fixture.detectChanges();
    const copyrightEl = element.querySelector<HTMLElement>('si-copyright-notice');
    expect(copyrightEl).toBeTruthy();

    expect(copyrightEl?.innerText).toContain('© Sample Company');
    expect(copyrightEl?.innerText).toContain(new Date().getFullYear());
    expect(copyrightEl?.innerText).not.toContain('-');
  });
});
