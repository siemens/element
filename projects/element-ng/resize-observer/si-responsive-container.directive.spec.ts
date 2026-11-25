/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiResponsiveContainerDirective } from './index';

@Component({
  imports: [SiResponsiveContainerDirective],
  template: `
    <div siResponsiveContainer [resizeThrottle]="10" [style.width.px]="width()">Testli</div>
  `
})
class TestHostComponent {
  readonly width = signal(100);
}

describe('SiResponsiveContainerDirective', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  const testSize = async (size: number, clazz: string): Promise<void> => {
    component.width.set(size);
    await fixture.whenStable();

    await vi.waitFor(() => {
      expect(element.querySelector<HTMLElement>('div')!).toHaveClass(clazz);
    });
  };

  it.for([
    [100, 'si-container-xs'],
    [580, 'si-container-sm'],
    [780, 'si-container-md'],
    [1000, 'si-container-lg'],
    [1200, 'si-container-xl']
  ] as const)('width %i sets %s class', async ([size, expected]) => {
    await testSize(size, expected);
  });
});
