/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Link } from '@siemens/element-ng/link';

import { SiFooterComponent } from './index';

describe('SiFooterComponent', () => {
  let fixture: ComponentFixture<SiFooterComponent>;
  let element: HTMLElement;

  let copyright: WritableSignal<string>;
  let links: WritableSignal<Link[] | undefined>;

  beforeEach(() => {
    copyright = signal('test copyright');
    links = signal<Link[] | undefined>([
      {
        title: 'About',
        link: '/main/components/si-about'
      },
      {
        title: 'Corporate Information',
        href: 'http://www.siemens.com/corporate-information'
      }
    ]);

    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(SiFooterComponent, {
      bindings: [inputBinding('copyright', copyright), inputBinding('links', links)]
    });
    element = fixture.nativeElement;
  });

  it('should contain set properties', async () => {
    copyright.set('copyright');
    links.set([
      {
        title: 'link',
        href: 'http://google.com'
      }
    ]);
    await fixture.whenStable();

    const copyrightEl = element.querySelector('.col-sm-4')!;
    const linkTitle = element.querySelector('a')!;
    expect(copyrightEl).toHaveTextContent('© copyright');
    expect(linkTitle).toHaveTextContent('link');
  });

  it('should contain external link', async () => {
    copyright.set('copyright');
    links.set([
      {
        title: 'link',
        href: 'http://google.com'
      }
    ]);
    await fixture.whenStable();

    const linkHref = element.querySelector('a')!;
    expect(linkHref).toHaveAttribute('href', expect.stringContaining('http://google.com'));
  });

  it('should contain internal router links', async () => {
    copyright.set('copyright');
    links.set([
      {
        title: 'link',
        link: '/main/documentation'
      }
    ]);
    await fixture.whenStable();

    const linkHref = element.querySelector('a')!;
    expect(linkHref).toHaveAttribute('href', expect.stringContaining('/main/documentation'));
  });
});
