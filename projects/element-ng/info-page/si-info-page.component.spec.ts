/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Link } from '@siemens/element-ng/link';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiInfoPageComponent as TestComponent } from '.';

describe('SiInfoPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const icon = signal<string>('element-warning-filled');
  const titleText = signal<TranslatableString>('');
  const copyText = signal<TranslatableString | undefined>(undefined);
  const instructions = signal<TranslatableString | undefined>(undefined);
  const link = signal<Link | undefined>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('titleText', titleText),
        inputBinding('copyText', copyText),
        inputBinding('instructions', instructions),
        inputBinding('link', link)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should contain all passed strings', async () => {
    icon.set('element-sun');
    titleText.set('Title');
    copyText.set('Subtitle');
    instructions.set('Some Description');
    await fixture.whenStable();

    const iconEl = element.querySelector('si-icon > div');
    expect(iconEl!).toHaveClass('element-sun');
    expect(element.querySelector('h1')!).toHaveTextContent('Title');
    expect(element.querySelector('h2')!).toHaveTextContent('Subtitle');
    expect(element.querySelector('p')!).toHaveTextContent('Some Description');
  });

  it('should invoke navigation on button press', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
    titleText.set('Title');
    link.set({ title: 'Go home', link: '/home' });
    await fixture.whenStable();

    element.querySelector<HTMLElement>('a.btn-primary')!.click();

    expect(router.navigateByUrl).toHaveBeenCalled();
  });
});
