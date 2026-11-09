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
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement;
  });

  const testSize = async (size: string | number, clazz: string | number): Promise<void> => {
    fixture.componentInstance.width.set(parseInt(size as string, 10));
    await fixture.whenStable();
    await vi.waitFor(() =>
      expect(element.querySelector<HTMLElement>('div')!).toHaveClass(clazz.toString())
    );
  };

  it.for([
    [100, 'si-container-xs'],
    [580, 'si-container-sm'],
    [780, 'si-container-md'],
    [1000, 'si-container-lg'],
    [1200, 'si-container-xl']
  ])('width %i sets %s class', async ([size, expected]) => {
    await testSize(size, expected);
  });
});
