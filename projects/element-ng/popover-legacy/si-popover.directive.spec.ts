/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiPopoverLegacyDirective } from './si-popover-legacy.directive';

@Component({
  imports: [SiPopoverLegacyDirective],
  template: `
    <button type="button" siPopoverLegacy="test popover content" [triggers]="triggers">Test</button>
  `
})
export class TestHostComponent {
  public triggers = 'click';

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
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should close when move focus outside', async () => {
    wrapperComponent.triggers = 'focus';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    const focusEvent = new Event('focus', { bubbles: true });
    button.dispatchEvent(focusEvent);

    await fixture.whenStable();
    expect(document.querySelector('.popover')).toBeInTheDocument();
    expect(document.querySelector('.popover')).toHaveTextContent('test popover content');

    const focusoutEvent = new Event('focusout', { bubbles: true });
    button.dispatchEvent(focusoutEvent);

    fixture.detectChanges();
    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = vi.spyOn(wrapperComponent.popoverOverlay()!.hidden, 'emit');
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });
});
