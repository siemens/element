/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Link } from '@siemens/element-ng/link';

import { LicenseInfo } from './si-about-data.model';
import { SiAboutComponent } from './si-about.component';

@Component({
  template: `
    <si-about
      [aboutTitle]="aboutTitle"
      [licenseInfo]="licenseInfo"
      [icon]="icon"
      [appName]="appName"
      [subheading]="subheading"
      [acceptableUsePolicyLink]="acceptableUsePolicyLink"
      [imprintLink]="imprintLink"
      [privacyLink]="privacyLink"
      [cookieNoticeLink]="cookieNoticeLink"
      [termsLink]="termsLink"
      [links]="links"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiAboutComponent]
})
class TestHostComponent {
  aboutTitle!: string;
  licenseInfo!: LicenseInfo;
  icon!: string;
  appName!: string;
  subheading!: string[];
  acceptableUsePolicyLink!: Link;
  imprintLink!: Link;
  privacyLink!: Link;
  cookieNoticeLink!: Link;
  termsLink!: Link;
  links!: Link[];
}

describe('SiAboutComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  const toggleCollapsePanel = (e?: HTMLElement): void =>
    (e ?? element).querySelector<HTMLElement>('.collapsible-header')?.click();

  const getLicenseApi = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('.license-api'));

  const getLicenseFiles = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('.license-api-file'));

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient(), provideNoopAnimations(), provideHttpClientTesting()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should contain set properties', () => {
    component.aboutTitle = 'About';
    component.licenseInfo = {
      title: 'License',
      text: 'This is a text for some licenses'
    };
    component.icon = 'https://lorempixel.com/200/200/sports/1/';
    component.appName = 'Application title';
    component.subheading = ['app version v0.1.2.alpha4', '© Examples.org 2016-2021'];
    component.acceptableUsePolicyLink = {
      title: 'Acceptable Use Policy',
      href: 'https://www.examples.org/sw-terms/aup'
    };
    component.imprintLink = { title: 'Corporate Information', href: 'http://www.examples.org' };
    component.privacyLink = { title: 'Privacy Notice', href: 'http://www.examples.org' };
    component.cookieNoticeLink = {
      title: 'Cookie Notice',
      href: 'https://www.examples.org/cookie-notice'
    };
    component.termsLink = { title: 'Terms and Conditions', href: 'http://www.examples.org' };
    component.links = [
      { title: 'Some other link', href: 'http://www.examples.org' },
      { title: 'More information about stuff', href: 'http://www.examples.org' }
    ];

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
    component.aboutTitle = 'About';
    component.licenseInfo = {
      title: 'License',
      text: 'This is a text for some licenses'
    };
    component.icon = 'https://lorempixel.com/200/200/sports/1/';
    component.appName = 'Application title';
    component.subheading = ['app version v0.1.2.alpha4', '© Examples.org 2016-2021'];

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
      // Set required component input's
      component.aboutTitle = '';
      component.appName = '';
      component.icon = '';

      component.licenseInfo = { title: 'Test' };
      fixture.detectChanges();
      expect(element.querySelector<HTMLIFrameElement>('iframe')).toBeFalsy();
    });

    it('should set the sanitizedUrl if iframe is enabled', () => {
      // Set required component input's
      component.aboutTitle = '';
      component.appName = '';
      component.icon = '';

      component.licenseInfo = { title: 'Test', iframe: '/text.txt' };
      fixture.detectChanges();
      expect(element.querySelector<HTMLIFrameElement>('iframe')!.src).toContain('/text.txt');
    });
  });

  describe('with API mode', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
      httpMock = TestBed.inject(HttpTestingController);
      // Set required component input's
      component.aboutTitle = '';
      component.appName = '';
      component.icon = '';
      component.licenseInfo = { title: '', text: '', api: '/licenses.json' };
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

    it('should fetch module license if only one module exists', () => {
      const components = [{ name: 'Component 1', href: '/component1.txt' }];
      httpMock.expectOne('/licenses.json').flush([{ name: 'Module 1', href: '/module1.json' }]);

      const reqLicense = httpMock.expectOne('/module1.json');
      expect(reqLicense.request.method).toEqual('GET');
      reqLicense.flush(components);
      fixture.detectChanges();

      toggleCollapsePanel();
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

    it('should fetch license content', () => {
      const content = 'License Data';

      httpMock
        .expectOne('/licenses.json')
        .flush([
          { name: 'Module', href: '', files: [{ name: 'Component 1', href: '/component1.txt' }] }
        ]);
      fixture.detectChanges();

      toggleCollapsePanel();
      toggleCollapsePanel(getLicenseFiles().at(0));

      const req = httpMock.expectOne('/component1.txt');
      req.flush(content);
      expect(req.request.method).toEqual('GET');

      fixture.detectChanges();
      expect(element.querySelector('.license-api-file-content')?.textContent).toEqual(content);
    });

    it('should not fetch license content if already loaded', () => {
      httpMock.expectOne('/licenses.json').flush([
        {
          name: 'Module',
          href: '',
          files: [{ name: 'Component 1', href: '/component1.txt', content: 'License' }]
        }
      ]);
      fixture.detectChanges();

      toggleCollapsePanel();
      toggleCollapsePanel(getLicenseFiles().at(0));

      httpMock.expectNone('/component1.txt');
      expect(element.querySelector('.license-api-file-content')?.textContent).toEqual('License');
    });
  });
});
