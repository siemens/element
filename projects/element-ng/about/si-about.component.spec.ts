/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Link } from '@siemens/element-ng/link';
import { page, userEvent } from 'vitest/browser';

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
  const logoAlt = signal<string | undefined>(undefined);

  const getLogoImg = (): HTMLImageElement | null => element.querySelector('img');

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
    logoAlt.set(undefined);
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
        inputBinding('links', linksInput),
        inputBinding('logoAlt', logoAlt)
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
    const subheading = element.querySelector('.list > div:first-child')!.innerHTML;
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
    const subheading = element.querySelector('.list > div:first-child')!.innerHTML;
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

  it('should show empty state when no license text, iframe, or api is provided', async () => {
    const root = page.elementLocator(element);
    licenseInfo.set({ title: 'License' });
    await fixture.whenStable();

    await expect.element(root.getByText('No licenses available.')).toBeVisible();

    licenseInfo.set({ title: 'License', text: '   ' });
    await fixture.whenStable();

    await expect.element(root.getByText('No licenses available.')).toBeVisible();
    expect(element.querySelector('pre')).not.toBeInTheDocument();
  });

  describe('logoAlt', () => {
    it('should use custom logoAlt with appName interpolated', async () => {
      appName.set('The');
      iconInput.set('https://example.com/logo.png');
      logoAlt.set('{{appName}} Application Logo');
      await fixture.whenStable();

      expect(getLogoImg()!.alt).toBe('The Application Logo');
    });
  });

  describe('with iFrame mode', () => {
    it('should not set the sanitizedUrl if iframe is not enabled', () => {
      licenseInfo.set({ title: 'Test' });
      fixture.detectChanges();
      expect(element.querySelector<HTMLIFrameElement>('iframe')).not.toBeInTheDocument();
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
        expect(actual.at(index)).toHaveTextContent(modules.at(index)!.name);
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
      expect(actual).toHaveLength(1);
      expect(actual.at(0)).toHaveTextContent('Component 1');
    });

    it('should not fetch module license if already loaded', () => {
      httpMock
        .expectOne('/licenses.json')
        .flush([{ name: 'Name', href: '/module1.json', content: 'License', files: [] }]);

      element.querySelector<HTMLElement>('.collapsible-header')?.click();
      fixture.detectChanges();
      toggleCollapsePanel();
      httpMock.expectNone('/module1.json');

      expect(getLicenseFiles()).toHaveLength(0);
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
      expect(element.querySelector('.license-api-file-content')).toHaveTextContent(content);
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
      expect(element.querySelector('.license-api-file-content')).toHaveTextContent('License');
    });

    it('should show loading skeleton with aria-busy and status announcement while license index loads', async () => {
      const root = page.elementLocator(element);
      const section = element.querySelector<HTMLElement>('.license-api-section')!;
      const status = root.getByRole('status');

      expect(section).toHaveAttribute('aria-busy', 'true');
      expect(section.querySelectorAll('.si-skeleton').length).toBeGreaterThan(0);
      expect(status.element().closest('[aria-busy="true"]')).toBeNull();
      await expect.element(status).toHaveTextContent('Loading licenses…');

      httpMock.expectOne('/licenses.json').flush([
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module2.json' }
      ]);
      await fixture.whenStable();

      expect(section).not.toHaveAttribute('aria-busy');
      expect(section.querySelectorAll('.si-skeleton')).toHaveLength(0);
      await expect.element(status).toHaveTextContent('');
      await expect.element(root.getByRole('button', { name: 'Module 1' })).toBeVisible();
    });

    it('should preserve Retry button focus across keyboard retries, second failure, and success', async () => {
      const root = page.elementLocator(element);

      httpMock
        .expectOne('/licenses.json')
        .flush('Error', { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).toHaveTextContent('Could not load licenses.');

      const retryButton = element.querySelector<HTMLButtonElement>('.license-api-error button')!;
      retryButton.focus();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();

      // Same button stays mounted, visibly focused, and aria-disabled while retrying
      expect(document.activeElement).toBe(retryButton);
      expect(retryButton).toHaveAttribute('aria-disabled', 'true');
      expect(element.querySelector('.license-api-section')).toHaveAttribute('aria-busy', 'true');
      await expect.element(root.getByRole('status')).toHaveTextContent('Loading licenses…');

      const retryReq1 = httpMock.expectOne('/licenses.json');
      // Repeated keyboard activation while pending does not fire duplicate request
      await userEvent.keyboard(' ');
      await fixture.whenStable();
      httpMock.expectNone('/licenses.json');

      // Second failure keeps the exact same Retry button focused and re-renders the alert
      retryReq1.flush('Error', { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      expect(document.activeElement).toBe(retryButton);
      expect(retryButton).not.toHaveAttribute('aria-disabled');
      await expect.element(root.getByRole('alert')).toHaveTextContent('Could not load licenses.');

      // Space retries again; on success focus moves to a visible fallback (first category button)
      await userEvent.keyboard(' ');
      await fixture.whenStable();

      httpMock.expectOne('/licenses.json').flush([
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module2.json' }
      ]);
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).not.toBeInTheDocument();
      await expect.element(root.getByRole('button', { name: 'Module 1' })).toHaveFocus();
    });

    it('should announce empty state when license index returns no items', async () => {
      const root = page.elementLocator(element);
      const section = page.elementLocator(element.querySelector('.license-api-section')!);

      httpMock.expectOne('/licenses.json').flush([]);
      await fixture.whenStable();

      await expect.element(section.getByText('No licenses available.')).toBeVisible();
      await expect.element(root.getByRole('status')).toHaveTextContent('No licenses available.');
    });

    it('should fetch empty inline content with valid href while caching empty HTTP responses', async () => {
      const root = page.elementLocator(element);
      const section = page.elementLocator(element.querySelector('.license-api-section')!);

      httpMock.expectOne('/licenses.json').flush([
        {
          name: 'Module',
          href: '/module.json',
          files: [
            { name: 'Component 1', href: '/component1.txt', content: '' },
            { name: 'Component 2', href: '/component2.txt', content: '' }
          ]
        }
      ]);
      await fixture.whenStable();

      await userEvent.click(root.getByRole('button', { name: 'Module' }));
      await fixture.whenStable();

      // Empty inline content with valid href still triggers fetch
      await userEvent.click(root.getByRole('button', { name: 'Component 1' }));
      await fixture.whenStable();

      httpMock.expectOne('/component1.txt').flush('Apache 2.0 License');
      await fixture.whenStable();

      await expect.element(root.getByText('Apache 2.0 License')).toBeVisible();

      // Empty HTTP response is cached and not re-fetched on subsequent toggle
      const component2Button = root.getByRole('button', { name: 'Component 2' });
      await userEvent.click(component2Button);
      await fixture.whenStable();

      httpMock.expectOne('/component2.txt').flush('');
      await fixture.whenStable();

      await expect.element(section.getByText('No license text available.')).toBeVisible();
      await expect
        .element(root.getByRole('status'))
        .toHaveTextContent('No license text available.');

      await userEvent.click(component2Button);
      await fixture.whenStable();
      await userEvent.click(component2Button);
      await fixture.whenStable();
      httpMock.expectNone('/component2.txt');
    });

    it('should show loading state for component list without duplicate requests on toggle', async () => {
      const root = page.elementLocator(element);

      httpMock.expectOne('/licenses.json').flush([
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module2.json' }
      ]);
      await fixture.whenStable();

      const moduleButton = root.getByRole('button', { name: 'Module 1' });
      await userEvent.click(moduleButton);
      await fixture.whenStable();

      const req = httpMock.expectOne('/module1.json');
      const region = element.querySelector<HTMLElement>('.license-api .license-api-panel-content')!;
      expect(region).toHaveAttribute('aria-busy', 'true');
      expect(region.querySelectorAll('.si-skeleton').length).toBeGreaterThan(0);

      // Collapse and re-expand while request is still in-flight
      await userEvent.click(moduleButton);
      await fixture.whenStable();
      await userEvent.click(moduleButton);
      await fixture.whenStable();
      httpMock.expectNone('/module1.json');

      req.flush([{ name: 'Component 1', href: '/component1.txt' }]);
      await fixture.whenStable();

      expect(
        element.querySelector<HTMLElement>('.license-api .license-api-panel-content')
      ).not.toHaveAttribute('aria-busy');
      await expect.element(root.getByRole('button', { name: 'Component 1' })).toBeVisible();
    });

    it('should show error state with retry when component list fails', async () => {
      const root = page.elementLocator(element);

      httpMock.expectOne('/licenses.json').flush([
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module2.json' }
      ]);
      await fixture.whenStable();

      await userEvent.click(root.getByRole('button', { name: 'Module 1' }));
      await fixture.whenStable();

      httpMock
        .expectOne('/module1.json')
        .flush('Error', { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).toHaveTextContent('Could not load licenses.');

      await userEvent.click(root.getByRole('button', { name: 'Retry' }));
      await fixture.whenStable();

      httpMock.expectOne('/module1.json').flush([{ name: 'Component 1', href: '/component1.txt' }]);
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).not.toBeInTheDocument();
      await expect.element(root.getByRole('button', { name: 'Component 1' })).toBeVisible();
    });

    it('should show error state and allow retry when single-module prefetch fails', async () => {
      const root = page.elementLocator(element);

      httpMock.expectOne('/licenses.json').flush([{ name: 'Module 1', href: '/module1.json' }]);
      httpMock
        .expectOne('/module1.json')
        .flush('Error', { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      // Alert is not rendered while panel is collapsed
      await expect.element(root.getByRole('alert')).not.toBeInTheDocument();

      await userEvent.click(root.getByRole('button', { name: 'Module 1' }));
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).toHaveTextContent('Could not load licenses.');

      await userEvent.click(root.getByRole('button', { name: 'Retry' }));
      await fixture.whenStable();

      httpMock.expectOne('/module1.json').flush([{ name: 'Component 1', href: '/component1.txt' }]);
      await fixture.whenStable();

      await expect.element(root.getByRole('button', { name: 'Component 1' })).toBeVisible();
    });

    it('should show empty state when component list returns no items', async () => {
      const root = page.elementLocator(element);
      const section = page.elementLocator(element.querySelector('.license-api-section')!);

      httpMock.expectOne('/licenses.json').flush([
        { name: 'Module 1', href: '/module1.json' },
        { name: 'Module 2', href: '/module2.json' }
      ]);
      await fixture.whenStable();

      await userEvent.click(root.getByRole('button', { name: 'Module 1' }));
      await fixture.whenStable();

      httpMock.expectOne('/module1.json').flush([]);
      await fixture.whenStable();

      await expect.element(section.getByText('No licenses available.')).toBeVisible();
      await expect.element(root.getByRole('status')).toHaveTextContent('No licenses available.');
    });

    it('should show loading, error with retry, and empty states for license text', async () => {
      const root = page.elementLocator(element);
      const section = page.elementLocator(element.querySelector('.license-api-section')!);

      httpMock.expectOne('/licenses.json').flush([
        {
          name: 'Module',
          href: '/module.json',
          files: [
            { name: 'Component 1', href: '/component1.txt' },
            { name: 'Component 2', href: '/component2.txt' }
          ]
        }
      ]);
      await fixture.whenStable();

      await userEvent.click(root.getByRole('button', { name: 'Module' }));
      await fixture.whenStable();

      // Loading -> Error -> Retry -> Success
      await userEvent.click(root.getByRole('button', { name: 'Component 1' }));
      await fixture.whenStable();

      const fileReq1 = httpMock.expectOne('/component1.txt');
      const fileContentRegion = element.querySelector<HTMLElement>(
        '.license-api-file .license-api-panel-content'
      )!;
      expect(fileContentRegion).toHaveAttribute('aria-busy', 'true');
      expect(fileContentRegion.querySelectorAll('.si-skeleton').length).toBeGreaterThan(0);
      await expect.element(root.getByRole('status')).toHaveTextContent('Loading license text…');

      fileReq1.flush('Error', { status: 404, statusText: 'Not Found' });
      await fixture.whenStable();

      await expect
        .element(root.getByRole('alert'))
        .toHaveTextContent('Could not load license text.');

      await userEvent.click(root.getByRole('button', { name: 'Retry' }));
      await fixture.whenStable();

      httpMock.expectOne('/component1.txt').flush('MIT License');
      await fixture.whenStable();

      await expect.element(root.getByRole('alert')).not.toBeInTheDocument();
      await expect.element(root.getByText('MIT License')).toBeVisible();

      // Empty / whitespace-only license text does not re-fetch on subsequent toggle
      const component2Button = root.getByRole('button', { name: 'Component 2' });
      await userEvent.click(component2Button);
      await fixture.whenStable();

      httpMock.expectOne('/component2.txt').flush('   \n');
      await fixture.whenStable();

      await expect.element(section.getByText('No license text available.')).toBeVisible();
      await expect
        .element(root.getByRole('status'))
        .toHaveTextContent('No license text available.');

      await userEvent.click(component2Button);
      await fixture.whenStable();
      await userEvent.click(component2Button);
      await fixture.whenStable();
      httpMock.expectNone('/component2.txt');
    });
  });
});
