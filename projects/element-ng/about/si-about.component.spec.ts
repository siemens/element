/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Link } from '@siemens/element-ng/link';

import { LicenseInfo } from './si-about-data.model';
import { SiAboutComponent } from './si-about.component';

describe('SiAboutComponent', () => {
  let fixture: ComponentFixture<SiAboutComponent>;
  let element: HTMLElement;
  const aboutTitle = signal('');
  const licenseInfo = signal<LicenseInfo>({ title: '' });
  const iconInput = signal<string | undefined>(undefined);
  const appName = signal('');
  const subheadingInput = signal<string[] | undefined>(undefined);
  const acceptableUsePolicyLink = signal<Link | undefined>(undefined);
  const imprintLink = signal<Link | undefined>(undefined);
  const privacyLink = signal<Link | undefined>(undefined);
  const cookieNoticeLink = signal<Link | undefined>(undefined);
  const termsLink = signal<Link | undefined>(undefined);
  const linksInput = signal<Link[]>([]);

  const toggleCollapsePanel = (e?: HTMLElement): void =>
    (e ?? element).querySelector<HTMLElement>('.collapsible-header')?.click();

  const getLicenseApi = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('.license-api'));

  const getLicenseFiles = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('.license-api-file'));

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
  );

  beforeEach(() => {
    aboutTitle.set('');
    licenseInfo.set({ title: '' });
    iconInput.set(undefined);
    appName.set('');
    subheadingInput.set(undefined);
    acceptableUsePolicyLink.set(undefined);
    imprintLink.set(undefined);
    privacyLink.set(undefined);
    cookieNoticeLink.set(undefined);
    termsLink.set(undefined);
    linksInput.set([]);
    fixture = TestBed.createComponent(SiAboutComponent, {
      bindings: [
        inputBinding('aboutTitle', aboutTitle),
        inputBinding('licenseInfo', licenseInfo),
        inputBinding('icon', iconInput),
        inputBinding('appName', appName),
        inputBinding('subheading', subheadingInput),
        inputBinding('acceptableUsePolicyLink', acceptableUsePolicyLink),
        inputBinding('imprintLink', imprintLink),
        inputBinding('privacyLink', privacyLink),
        inputBinding('cookieNoticeLink', cookieNoticeLink),
        inputBinding('termsLink', termsLink),
        inputBinding('links', linksInput)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should contain set properties', () => {
    aboutTitle.set('About');
    licenseInfo.set({
      title: 'License',
      text: 'This is a text for some licenses'
    });
    appName.set('Application title');
    iconInput.set('https://lorempixel.com/200/200/sports/1/');
    subheadingInput.set(['app version v0.1.2.alpha4', '© Examples.org 2016-2021']);
    acceptableUsePolicyLink.set({
      title: 'Acceptable Use Policy',
      href: 'https://www.examples.org/sw-terms/aup'
    });
    imprintLink.set({ title: 'Corporate Information', href: 'http://www.examples.org' });
    privacyLink.set({ title: 'Privacy Notice', href: 'http://www.examples.org' });
    cookieNoticeLink.set({
      title: 'Cookie Notice',
      href: 'https://www.examples.org/cookie-notice'
    });
    termsLink.set({ title: 'Terms and Conditions', href: 'http://www.examples.org' });
    linksInput.set([
      { title: 'Some other link', href: 'http://www.examples.org' },
      { title: 'More information about stuff', href: 'http://www.examples.org' }
    ]);

    fixture.detectChanges();

    const title = element.querySelectorAll('.card-header')[0]!.innerHTML;
    const licenseTitle = element.querySelectorAll('.card-header')[1]!.innerHTML;
    const licenseText = element.querySelector('pre')!.innerHTML;
    const icon = element.querySelector('img')!.getAttribute('src');
    const heading = element.querySelector('img + h3')!.innerHTML;
    const subheading = element.querySelector('.list-group-item:first-of-type')!.innerHTML;
    const links = element.querySelector('.card:first-of-type')!.innerHTML;

    expect(title).toContain('About');
    expect(licenseTitle).toContain('License');
    expect(licenseText).toContain('This is a text for some licenses');
    expect(icon).toContain('https://lorempixel.com/200/200/sports/1/');
    expect(heading).toContain('Application title');
    expect(subheading).toContain('app version v0.1.2.alpha4');
    expect(subheading).toContain('© Examples.org 2016-2021');
    expect(links).toContain('Acceptable Use Policy');
    expect(links).toContain('Corporate Information');
    expect(links).toContain('Privacy Notice');
    expect(links).toContain('Cookie Notice');
    expect(links).toContain('Terms and Conditions');
    expect(links).toContain('Some other link');
    expect(links).toContain('More information about stuff');
  });

  it('should correctly display the content when links are not provided', () => {
    aboutTitle.set('About');
    licenseInfo.set({
      title: 'License',
      text: 'This is a text for some licenses'
    });
    appName.set('Application title');
    iconInput.set('https://lorempixel.com/200/200/sports/1/');
    subheadingInput.set(['app version v0.1.2.alpha4', '© Examples.org 2016-2021']);

    fixture.detectChanges();

    const title = element.querySelectorAll('.card-header')[0]!.innerHTML;
    const licenseTitle = element.querySelectorAll('.card-header')[1]!.innerHTML;
    const licenseText = element.querySelector('pre')!.innerHTML;
    const icon = element.querySelector('img')!.getAttribute('src');
    const heading = element.querySelector('img + h3')!.innerHTML;
    const subheading = element.querySelector('.list-group-item:first-of-type')!.innerHTML;
    const links = element.querySelector('.card:first-of-type')!.innerHTML;

    expect(title).toContain('About');
    expect(licenseTitle).toContain('License');
    expect(licenseText).toContain('This is a text for some licenses');
    expect(icon).toContain('https://lorempixel.com/200/200/sports/1/');
    expect(heading).toContain('Application title');
    expect(subheading).toContain('app version v0.1.2.alpha4');
    expect(subheading).toContain('© Examples.org 2016-2021');
    expect(links).not.toContain('Corporate Information');
    expect(links).not.toContain('Privacy Notice');
    expect(links).not.toContain('Terms and Conditions');
    expect(links).not.toContain('Some other link');
    expect(links).not.toContain('More information about stuff');
  });

  describe('with iFrame mode', () => {
    it('should not set the sanitizedUrl if iframe is not enabled', () => {
      licenseInfo.set({ title: 'Test' });
      fixture.detectChanges();
      expect(element.querySelector<HTMLIFrameElement>('iframe')).toBeFalsy();
    });

    it('should set the sanitizedUrl if iframe is enabled', () => {
      licenseInfo.set({ title: 'Test', iframe: '/text.txt' });
      fixture.detectChanges();
      expect(element.querySelector<HTMLIFrameElement>('iframe')!.src).toContain('/text.txt');
    });
  });

  describe('with API mode', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
      httpMock = TestBed.inject(HttpTestingController);
      licenseInfo.set({ title: '', text: '', api: '/licenses.json' });
      fixture.autoDetectChanges();
    });

    afterEach(() => httpMock.verify());

    it('should fetch module data', () => {
      const modules = [
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module1.json' }
      ];

      const req = httpMock.expectOne('/licenses.json');
      expect(req.request.method).toEqual('GET');
      req.flush(modules);
      fixture.detectChanges();

      const actual = getLicenseApi();
      for (let index = 0; index < modules.length; index++) {
        expect(actual.at(index)?.textContent).toContain(modules.at(index)?.name);
      }
    });

    it('should fetch module license if only one module exists', async () => {
      const components = [{ name: 'Component 1', href: '/component1.txt' }];
      httpMock.expectOne('/licenses.json').flush([{ name: 'Module 1', href: '/module1.json' }]);

      const reqLicense = httpMock.expectOne('/module1.json');
      expect(reqLicense.request.method).toEqual('GET');
      reqLicense.flush(components);
      fixture.detectChanges();

      toggleCollapsePanel();

      await fixture.whenStable();
      const actual = getLicenseFiles();
      expect(actual).toHaveSize(1);
      expect(actual.at(0)?.textContent).toContain('Component 1');
    });

    it('should not fetch module license if already loaded', () => {
      httpMock
        .expectOne('/licenses.json')
        .flush([{ name: 'Name', href: '/module1.json', content: 'License', files: [] }]);

      element.querySelector<HTMLElement>('.collapsible-header')?.click();
      fixture.detectChanges();
      toggleCollapsePanel();
      httpMock.expectNone('/module1.json');

      expect(getLicenseFiles()).toHaveSize(0);
    });

    it('should fetch license content', async () => {
      const content = 'License Data';

      httpMock
        .expectOne('/licenses.json')
        .flush([
          { name: 'Module', href: '', files: [{ name: 'Component 1', href: '/component1.txt' }] }
        ]);
      fixture.detectChanges();

      toggleCollapsePanel();
      await fixture.whenStable();
      toggleCollapsePanel(getLicenseFiles().at(0));
      await fixture.whenStable();

      const req = httpMock.expectOne('/component1.txt');
      req.flush(content);
      expect(req.request.method).toEqual('GET');

      fixture.detectChanges();
      expect(element.querySelector('.license-api-file-content')?.textContent).toEqual(content);
    });

    it('should not fetch license content if already loaded', async () => {
      httpMock.expectOne('/licenses.json').flush([
        {
          name: 'Module',
          href: '',
          files: [{ name: 'Component 1', href: '/component1.txt', content: 'License' }]
        }
      ]);
      fixture.detectChanges();

      toggleCollapsePanel();
      await fixture.whenStable();
      toggleCollapsePanel(getLicenseFiles().at(0));
      await fixture.whenStable();

      httpMock.expectNone('/component1.txt');
      expect(element.querySelector('.license-api-file-content')?.textContent).toEqual('License');
    });
  });
});
