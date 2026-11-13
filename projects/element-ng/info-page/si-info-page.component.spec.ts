/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Link } from '@siemens/element-ng/link';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiInfoPageComponent as TestComponent } from '.';

describe('SiInfoPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  let icon: WritableSignal<string>;
  let titleText: WritableSignal<TranslatableString>;
  let description: WritableSignal<TranslatableString | undefined>;
  let copyText: WritableSignal<TranslatableString | undefined>;
  let instructions: WritableSignal<TranslatableString | undefined>;
  let link: WritableSignal<Link | undefined>;

  beforeEach(() => {
    icon = signal('element-warning-filled');
    titleText = signal('');
    description = signal(undefined);
    copyText = signal(undefined);
    instructions = signal(undefined);
    link = signal(undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('titleText', titleText),
        inputBinding('description', description),
        inputBinding('copyText', copyText),
        inputBinding('instructions', instructions),
        inputBinding('link', link)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should render the deprecated copy text and instructions', async () => {
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

  it('should prefer the description over deprecated text inputs', async () => {
    titleText.set('Title');
    description.set('New description');
    copyText.set('Legacy copy text');
    instructions.set('Legacy instructions');
    await fixture.whenStable();

    expect(element.querySelector('p')!).toHaveTextContent('New description');
    expect(element.querySelector('h2')).toBeNull();
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
