/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Link } from '@siemens/element-ng/link';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import { SiFooterComponent } from './index';

@Component({
  template: `<si-footer copyright="copyright" [links]="links" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFooterComponent]
})
class TestHostComponent {
  readonly component = viewChild.required(SiFooterComponent);
  copyright = 'test copyright';
  links: Link[] = [
    {
      title: 'About',
      link: '/main/components/si-about'
    },
    {
      title: 'Corporate Information',
      href: 'http://www.siemens.com/corporate-information'
    }
  ];
}
describe('SiFooterComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should contain set properties', () => {
    component.copyright = 'copyright';
    component.links = [
      {
        title: 'link',
        href: 'http://google.com'
      }
    ];

    fixture.detectChanges();

    const copyright = element.querySelector('.col-sm-4')!.innerHTML;
    const linkTitle = element.querySelector('a')!.innerHTML;
    expect(copyright).toContain('© copyright');
    expect(linkTitle).toContain('link');
  });

  it('should contain external link', () => {
    component.copyright = 'copyright';
    component.links = [
      {
        title: 'link',
        href: 'http://google.com'
      }
    ];

    fixture.detectChanges();

    const linkHref = element.querySelector('a')!.getAttribute('href');
    expect(linkHref).toContain('http://google.com');
  });

  it('should contain internal router links', async () => {
    component.copyright = 'copyright';
    component.links = [
      {
        title: 'link',
        link: '/main/documentation'
      }
    ];

    await runOnPushChangeDetection(fixture);
    fixture.detectChanges();

    const linkHref = element.querySelector('a')!.getAttribute('href');
    expect(linkHref).toContain('/main/documentation');
  });
});
