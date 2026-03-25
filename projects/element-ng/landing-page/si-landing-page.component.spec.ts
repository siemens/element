/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Link } from '@siemens/element-ng/link';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiLandingPageComponent as TestComponent } from '.';
import { AlertConfig } from './alert-config.model';

describe('SiLandingPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const heading = signal<TranslatableString>('');
  const subtitle = signal<TranslatableString>('');
  const links = signal<Link[]>([]);
  const announcement = signal<AlertConfig | undefined>(undefined);

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('subtitle', subtitle),
        inputBinding('links', links),
        inputBinding('announcement', announcement)
      ]
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('displays the heading', async () => {
    heading.set('my heading');
    subtitle.set('my subtitle');
    await fixture.whenStable();

    const headingEl = element.querySelector('.landing-page-main .si-h1-bold');
    expect(headingEl).toHaveTextContent('my heading');
  });

  it('displays the subtitle', async () => {
    heading.set('required heading');
    subtitle.set('my subtitle');
    await fixture.whenStable();

    const subtitleEl = element.querySelector('.landing-page-main .si-h2');
    expect(subtitleEl).toHaveTextContent('my subtitle');
  });

  it('displays the links', async () => {
    heading.set('required heading');
    subtitle.set('my subtitle');
    links.set([
      { title: 'Privacy Notice', href: 'https://privacy/' },
      { title: 'Terms of Use', href: 'https://terms/' }
    ]);
    await fixture.whenStable();

    expect(element.querySelector('footer .flex-row')).toHaveTextContent(
      'Privacy Notice Terms of Use'
    );

    const linkEls = element.querySelectorAll('footer a');

    expect(linkEls.length).toBe(2);
    expect(linkEls[0]).toHaveTextContent('Privacy Notice');
    expect((linkEls[0] as HTMLAnchorElement).href).toBe('https://privacy/');
    expect(linkEls[1]).toHaveTextContent('Terms of Use');
    expect((linkEls[1] as HTMLAnchorElement).href).toBe('https://terms/');
  });

  it('executes the link action handler', async () => {
    heading.set('required heading');
    subtitle.set('my subtitle');
    const spy = vi.fn();
    links.set([{ title: 'Privacy Notice', action: spy }]);
    await fixture.whenStable();

    const linkEls = element.querySelectorAll('footer a');
    expect(linkEls.length).toBe(1);
    (linkEls[0] as HTMLElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('displays the alert when alert config is passed', async () => {
    announcement.set({
      severity: 'warning',
      message: 'Test message',
      heading: ''
    });
    heading.set('my heading');
    subtitle.set('my subtitle');
    await fixture.whenStable();

    const alert = element.querySelector('.alert-warning > div');
    expect(alert).toHaveTextContent('Test message');
  });

  it('hides the alert when alert config is not passed', async () => {
    announcement.set(undefined);
    heading.set('my heading');
    subtitle.set('my subtitle');
    await fixture.whenStable();

    const alert = element.querySelector('.alert-warning');
    expect(alert).toBeFalsy();
  });
});
