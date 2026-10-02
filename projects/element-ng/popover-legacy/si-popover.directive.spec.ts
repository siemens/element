/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiPopoverLegacyDirective } from './si-popover-legacy.directive';

@Component({
  imports: [SiPopoverLegacyDirective],
  template: `
    <button type="button" siPopoverLegacy="test popover content" [triggers]="triggers()">
      Test
    </button>
  `
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

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should open on click', async () => {
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button')!;
    button.click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    button.click();
    await fixture.whenStable();
    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should close when move focus outside', async () => {
    wrapperComponent.triggers.set('focus');
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button')!;

    button.focus();
    await fixture.whenStable();
    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    button.blur();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = vi.spyOn(wrapperComponent.popoverOverlay()!.hidden, 'emit');
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });
});
