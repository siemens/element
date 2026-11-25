/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiBadgeComponent } from './si-badge.component';

describe('SiBadgeComponent', () => {
  it('updates the badge size while retaining its status and icon', async () => {
    const size = signal<'regular' | 'small'>('regular');
    const fixture = TestBed.createComponent(SiBadgeComponent, {
      bindings: [
        inputBinding('size', size),
        inputBinding('type', () => 'success'),
        inputBinding('icon', () => 'element-validation-success')
      ]
    });
    await fixture.whenStable();

    const badge = fixture.nativeElement as HTMLElement;
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveClass('bg-success');
    expect(badge).not.toHaveClass('badge-sm');
    expect(badge.querySelector('si-icon')).toBeInTheDocument();

    size.set('small');
    await fixture.whenStable();
    expect(badge).toHaveClass('badge-sm', 'bg-success');
    expect(badge.querySelector('si-icon')).toBeInTheDocument();

    size.set('regular');
    await fixture.whenStable();
    expect(badge).not.toHaveClass('badge-sm');
    expect(badge).toHaveClass('bg-success');
  });
});
