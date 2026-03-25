/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyrightDetails, SI_COPYRIGHT_DETAILS } from '@siemens/element-ng/copyright-notice';

import { SiCopyrightNoticeComponent } from './si-copyright-notice.component';

describe('SiCopyrightNoticeComponent', () => {
  let fixture: ComponentFixture<SiCopyrightNoticeComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SI_COPYRIGHT_DETAILS,
          useValue: {
            company: 'Sample Company',
            startYear: 2012,
            lastUpdateYear: 2019
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SiCopyrightNoticeComponent);
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should fetch from injector and assign default company', () => {
    fixture.detectChanges();

    expect(element).toHaveTextContent('Sample Company');
    expect(element).toHaveTextContent('2012');
    expect(element).toHaveTextContent('-');
  });

  it('should print the correct last updated year when globally injected', () => {
    fixture.detectChanges();

    expect(element).toHaveTextContent('-');
    expect(element).toHaveTextContent('2019');
  });
});

describe('SiCopyrightNoticeComponentWithInput', () => {
  let fixture: ComponentFixture<SiCopyrightNoticeComponent>;
  let element: HTMLElement;
  let copyright: WritableSignal<CopyrightDetails | undefined>;

  beforeEach(() => {
    copyright = signal({
      startYear: 2020,
      company: 'My Company',
      lastUpdateYear: 2021
    });
    fixture = TestBed.createComponent(SiCopyrightNoticeComponent, {
      bindings: [inputBinding('copyright', copyright)]
    });
    element = fixture.nativeElement;
  });

  it('should initialize component', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should reflect input changes', () => {
    fixture.detectChanges();

    expect(element).toHaveTextContent('My Company');
    expect(element).toHaveTextContent('2020');
    expect(element).toHaveTextContent('-');
  });

  it('should print the correct last updated year', () => {
    fixture.detectChanges();

    expect(element).toHaveTextContent('-');
    expect(element).toHaveTextContent('2021');
  });

  it('should print default copyright notice when no input is given', () => {
    copyright.set(undefined);
    fixture.detectChanges();

    expect(window.getComputedStyle(element.querySelector('.company')!, ':after').content).toContain(
      'ExampleOrg'
    );
    expect(element).toHaveTextContent('©');
    expect(element).toHaveTextContent(new Date().getFullYear() + '');
    expect(element).not.toHaveTextContent('-');
  });
});
