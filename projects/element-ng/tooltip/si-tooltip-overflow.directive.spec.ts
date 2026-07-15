/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { SiTooltipOverflowDirective } from './si-tooltip-overflow.directive';

describe('SiTooltipOverflowDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLDivElement;

  @Component({
    imports: [SiTooltipOverflowDirective],
    template: `<div siTooltipOverflow [style.width.px]="width()">{{ text() }}</div>`
  })
  class TestHostComponent {
    readonly text = signal(
      'A deliberately long tooltip text that does not fit in a narrow element'
    );
    readonly width = signal(100);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setTimerTickMode('nextTimerAsync');
    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement.querySelector('div') as HTMLDivElement;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show the host text only when it overflows', async () => {
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseenter'));
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    await expect
      .element(
        page.getByRole('tooltip', {
          name: 'A deliberately long tooltip text that does not fit in a narrow element'
        })
      )
      .toBeInTheDocument();
  });

  it('should not show a tooltip when the host text fits', async () => {
    fixture.componentInstance.width.set(1_000);
    await vi.advanceTimersByTimeAsync(0);
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should update the visible tooltip when the host text changes', async () => {
    await fixture.whenStable();
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.componentInstance.text.set('Updated overflowing tooltip text');
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    await expect
      .element(page.getByRole('tooltip'))
      .toHaveTextContent('Updated overflowing tooltip text');
  });

  it('should remove the tooltip when overflow is resolved', async () => {
    await fixture.whenStable();
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.componentInstance.width.set(1_000);
    await vi.advanceTimersByTimeAsync(0);
    await fixture.whenStable();

    element.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(500);
    await fixture.whenStable();

    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
  });
});
