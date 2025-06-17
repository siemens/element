/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { SiIconModule } from '@siemens/element-ng/icon';

import { SiUnauthorizedPageComponent as TestComponent } from '.';

describe('SiUnauthorizedPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiIconModule, TestComponent, RouterModule]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    element = fixture.nativeElement;
  });

  it('should contain all passed strings', () => {
    fixture.componentRef.setInput('icon', 'element-sun');
    fixture.componentRef.setInput('heading', 'Title');
    fixture.componentRef.setInput('subHeading', 'Subtitle');
    fixture.componentRef.setInput('description', 'Some Description');
    fixture.detectChanges();

    const icon = element.querySelector('si-icon-next div');
    expect(icon!.classList).toContain('element-sun');
    expect(element.querySelector('h1')!.textContent).toContain('Title');
    expect(element.querySelector('h2')!.textContent).toContain('Subtitle');
    expect(element.querySelector('p')!.textContent).toContain('Some Description');
  });

  it('should invoke navigation on button press', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.componentRef.setInput('link', { title: 'Go home', link: '/home' });
    fixture.detectChanges();

    element.querySelector<HTMLElement>('a.btn-primary')!.click();

    expect(router.navigateByUrl).toHaveBeenCalled();
  });
});
