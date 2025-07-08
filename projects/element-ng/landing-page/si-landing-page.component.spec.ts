/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiLandingPageComponent as TestComponent } from '.';

describe('SiLandingPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
  });

  it('displays the heading', () => {
    component.setInput('heading', 'my heading');
    component.setInput('subtitle', 'my subtitle');
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('.landing-page-main .si-h1-black');
    expect(heading.textContent).toEqual('my heading');
  });

  it('displays the subtitle', () => {
    component.setInput('heading', 'required heading');
    component.setInput('subtitle', 'my subtitle');
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.landing-page-main .si-h2');
    expect(subtitle.textContent).toEqual('my subtitle');
  });

  it('displays the links', () => {
    component.setInput('heading', 'required heading');
    component.setInput('subtitle', 'my subtitle');
    component.setInput('links', [
      { title: 'Privacy Notice', href: 'https://privacy/' },
      { title: 'Terms of Use', href: 'https://terms/' }
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('footer .flex-row').textContent.trim()).toBe(
      'Privacy Notice  Terms of Use'
    );

    const links = fixture.nativeElement.querySelectorAll('footer a');

    expect(links.length).toBe(2);
    expect(links[0].textContent.trim()).toBe('Privacy Notice');
    expect(links[0].href).toBe('https://privacy/');
    expect(links[1].textContent.trim()).toBe('Terms of Use');
    expect(links[1].href).toBe('https://terms/');
  });

  it('executes the link action handler', () => {
    component.setInput('heading', 'required heading');
    component.setInput('subtitle', 'my subtitle');
    const spy = jasmine.createSpy();
    component.setInput('links', [{ title: 'Privacy Notice', action: spy }]);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('footer a');
    expect(links.length).toBe(1);
    links[0].click();
    expect(spy).toHaveBeenCalled();
  });

  it('displays the alert when alert config is passed', () => {
    component.setInput('announcement', {
      severity: 'warning',
      message: 'Test message',
      heading: ''
    });
    component.setInput('heading', 'my heading');
    component.setInput('subtitle', 'my subtitle');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-warning > div');
    expect(alert.textContent).toEqual('Test message');
  });

  it('hides the alert when alert config is not passed', () => {
    component.setInput('announcement', undefined);
    component.setInput('heading', 'my heading');
    component.setInput('subtitle', 'my subtitle');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-warning');
    expect(alert).toBeFalsy();
  });
});
