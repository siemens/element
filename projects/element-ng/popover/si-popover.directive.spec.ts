/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { SiPopoverDirective } from './si-popover.directive';

@Component({
  imports: [SiPopoverDirective],
  template: `
    <button type="button" siPopover="test popover content" [triggers]="triggers">Test</button>
  `
})
export class TestHostComponent {
  public triggers = 'click';

  readonly popoverOverlay = viewChild(SiPopoverDirective);
}

describe('SiPopoverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let wrapperComponent: TestHostComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should open on click', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    expect(document.querySelector('.popover')).toBeTruthy();
    expect(document.querySelector('.popover')?.innerHTML).toContain('test popover content');

    fixture.nativeElement.querySelector('button').click();
    flush();

    expect(document.querySelector('.popover')).toBeFalsy();
  }));

  it('should close when move focus outside', fakeAsync(() => {
    wrapperComponent.triggers = 'focus';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    const focusEvent = new Event('focus', { bubbles: true });
    button.dispatchEvent(focusEvent);

    expect(document.querySelector('.popover')).toBeTruthy();
    expect(document.querySelector('.popover')?.innerHTML).toContain('test popover content');

    const focusoutEvent = new Event('focusout', { bubbles: true });
    button.dispatchEvent(focusoutEvent);

    fixture.detectChanges();
    expect(document.querySelector('.popover')).toBeFalsy();
    flush();
  }));

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = spyOn(wrapperComponent.popoverOverlay()!.hidden, 'emit').and.callThrough();
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });
});
