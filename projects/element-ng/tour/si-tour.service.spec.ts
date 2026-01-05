/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show/hide modal', async () => {
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
    await fixture.whenStable();
    fixture.detectChanges();

    const tour = document.querySelector('si-tour');
    expect(tour).not.toBeNull();

    const title = tour?.querySelector<HTMLDivElement>('div.si-h4');
    expect(title?.innerText).toBe(' Div element ');
    const next = tour?.querySelector<HTMLButtonElement>('button.btn-primary');
    expect(next?.innerText).toBe('Next');
    const skip = tour?.querySelector<HTMLButtonElement>('button.btn-tertiary');
    expect(skip?.innerText).toBe('Skip tour');

    component.tourService.complete();
  });
});
