/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { SiPopoverLegacyDirective } from './si-popover-legacy.directive';

@Component({
  imports: [SiPopoverLegacyDirective],
  template: `
    <button type="button" siPopoverLegacy="test popover content" [triggers]="triggers()">
      Test
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestHostComponent {
  readonly triggers = signal('click');

  readonly popoverOverlay = viewChild(SiPopoverLegacyDirective);
}

describe('SiPopoverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let wrapperComponent: TestHostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should open on click', async () => {
    await fixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Test' }));

    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    fixture.nativeElement.querySelector('button').click();
    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should close when move focus outside', async () => {
    wrapperComponent.triggers.set('focus');
    await fixture.whenStable();

    await userEvent.tab();
    await fixture.whenStable();
    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    await userEvent.tab();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = vi.spyOn(wrapperComponent.popoverOverlay()!.hidden, 'emit');
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });
});
