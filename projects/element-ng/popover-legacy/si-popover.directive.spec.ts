/**
 * Copyright (c) Siemens 2016 - 2025
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

    expect(document.querySelector('.popover')).toBeTruthy();
    expect(document.querySelector('.popover')?.innerHTML).toContain('test popover content');

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeFalsy();
  });

  it('should close when move focus outside', async () => {
    wrapperComponent.triggers = 'focus';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    const focusEvent = new Event('focus', { bubbles: true });
    button.dispatchEvent(focusEvent);

    await fixture.whenStable();
    expect(document.querySelector('.popover')).toBeTruthy();
    expect(document.querySelector('.popover')?.innerHTML).toContain('test popover content');

    const focusoutEvent = new Event('focusout', { bubbles: true });
    button.dispatchEvent(focusoutEvent);

    fixture.detectChanges();
    expect(document.querySelector('.popover')).toBeFalsy();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = spyOn(wrapperComponent.popoverOverlay()!.hidden, 'emit').and.callThrough();
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });
});
