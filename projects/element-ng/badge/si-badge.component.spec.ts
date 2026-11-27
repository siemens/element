/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiBadgeComponent } from './si-badge.component';

@Component({
  imports: [SiBadgeComponent],
  template: `
    <si-badge type="success" icon="element-validation-success" [size]="size()">
      Available
    </si-badge>
  `
})
class TestHostComponent {
  readonly size = signal<'regular' | 'small'>('regular');
}

describe('SiBadgeComponent', () => {
  it('switches badge and icon sizes without changing the displayed status', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();

    const badge = (fixture.nativeElement as HTMLElement).querySelector('si-badge');
    const icon = badge?.querySelector('si-icon');
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveTextContent('Available');
    expect(badge).toHaveClass('bg-success');
    expect(badge).not.toHaveClass('badge-sm');
    expect(icon).toHaveClass('icon');

    fixture.componentInstance.size.set('small');
    await fixture.whenStable();
    expect(badge).toHaveTextContent('Available');
    expect(badge).toHaveClass('bg-success', 'badge-sm');
    expect(icon).toHaveClass('icon-sm');
    expect(icon).not.toHaveClass('icon');

    fixture.componentInstance.size.set('regular');
    await fixture.whenStable();
    expect(badge).not.toHaveClass('badge-sm');
    expect(icon).toHaveClass('icon');
    expect(icon).not.toHaveClass('icon-sm');
  });
});
