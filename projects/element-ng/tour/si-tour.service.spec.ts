/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { SiTourService } from './si-tour.service';

@Component({
  template: `<div class="h-10">Test</div>`
})
class TestHostComponent {
  tourService = inject(SiTourService);
}

describe('SiTourService', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show/hide modal', fakeAsync(() => {
    fixture.detectChanges();
    component.tourService.addSteps([
      {
        attachTo: {
          element: '.h-10'
        },
        id: 'test1',
        title: 'Div element',
        text: 'Information about div element'
      },
      {
        id: 'test2',
        title: 'No element',
        text: 'Modal should be in centre'
      }
    ]);
    component.tourService.start();
    flush();
    fixture.detectChanges();

    const tour = document.querySelector('si-tour');
    expect(tour).not.toBeNull();

    const title = tour?.querySelector<HTMLDivElement>('div.si-title-1');
    expect(title?.innerText).toBe('Div element');
    const next = tour?.querySelector<HTMLButtonElement>('button.btn-primary');
    expect(next?.innerText).toBe('Next');
    const skip = tour?.querySelector<HTMLButtonElement>('button.btn-tertiary');
    expect(skip?.innerText).toBe('Skip tour');

    component.tourService.complete();
    flush();
  }));
});
