/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { SiPopoverNextDirective } from './si-popover-next.directive';

const generateKeyEvent = (key: string): KeyboardEvent => {
  const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

@Component({
  imports: [SiPopoverNextDirective],
  template: ` <button type="button" siPopoverNext="test popover content">Test</button> `
})
export class HostComponent {
  readonly popoverOverlay = viewChild(SiPopoverNextDirective);
}

@Component({
  imports: [SiPopoverNextDirective],
  template: `
    <button type="button" [siPopoverNext]="popoverTemplate"> Test with custom template </button>
    <ng-template #popoverTemplate>
      <div class="popover-content">
        <input type="text" id="input-1" />
        <button type="button" id="button-1">Button 1</button>
      </div>
    </ng-template>
  `
})
export class CustomTemplateHostComponent {}

describe('SiPopoverNextDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let wrapperComponent: HostComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, CustomTemplateHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should open/close on click', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    // Closes on button click
    fixture.nativeElement.querySelector('button').click();
    flush();

    expect(document.querySelector('.popover')).toBeFalsy();
  }));

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = spyOn(
      wrapperComponent.popoverOverlay()!.visibilityChange,
      'emit'
    ).and.callThrough();
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });

  it('should close on ESC press', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    popover.dispatchEvent(generateKeyEvent('Escape'));
    flush();

    expect(document.querySelector('.popover')).toBeFalsy();
  }));

  it('should close on outside click', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    document.body.click();
    flush();

    expect(document.querySelector('.popover')).toBeFalsy();
  }));

  it('should not close if click starts on the popover', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    popover.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    flush();

    expect(document.querySelector('.popover')).toBeTruthy();
  }));

  it('should not close if click ends on the popover', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    popover.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    flush();

    expect(document.querySelector('.popover')).toBeTruthy();
  }));

  it('should focus on the popover wrapper', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    expect(document.activeElement).toBe(document.querySelector('.popover'));
  }));
});

describe('with custom template', () => {
  let fixture: ComponentFixture<CustomTemplateHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateHostComponent);
  });

  it('should focus on the first interactive element', fakeAsync(() => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    flush();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();

    expect(document.activeElement).toBe(document.querySelector('#input-1'));
  }));
});
