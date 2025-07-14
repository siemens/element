/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';

import { SiInfoPageComponent as TestComponent } from '.';

describe('SiInfoPageComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent, RouterModule]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    element = fixture.nativeElement;
  });

  it('should contain all passed strings', () => {
    component.setInput('icon', 'element-sun');
    component.setInput('titleText', 'Title');
    component.setInput('copyText', 'Subtitle');
    component.setInput('instructions', 'Some Description');
    fixture.detectChanges();

    const icon = element.querySelector('si-icon-next > div');
    expect(icon!.classList).toContain('element-sun');
    expect(element.querySelector('h1')!.textContent).toContain('Title');
    expect(element.querySelector('h2')!.textContent).toContain('Subtitle');
    expect(element.querySelector('p')!.textContent).toContain('Some Description');
  });

  it('should invoke navigation on button press', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    component.setInput('titleText', 'Title');
    component.setInput('link', { title: 'Go home', link: '/home' });
    fixture.detectChanges();

    element.querySelector<HTMLElement>('a.btn-primary')!.click();

    expect(router.navigateByUrl).toHaveBeenCalled();
  });
});
