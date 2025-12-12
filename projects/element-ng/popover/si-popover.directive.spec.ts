/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiPopoverDirective } from './si-popover.directive';

const generateKeyEvent = (key: string): KeyboardEvent => {
  const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

@Component({
  imports: [SiPopoverDirective],
  template: ` <button type="button" siPopover="test popover content">Test</button> `
})
export class HostComponent {
  readonly popoverOverlay = viewChild(SiPopoverDirective);
}

@Component({
  imports: [SiPopoverDirective],
  template: `
    <button type="button" [siPopover]="popoverTemplate"> Test with custom template </button>
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, CustomTemplateHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should open/close on click', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    // Closes on button click
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeFalsy();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = spyOn(
      wrapperComponent.popoverOverlay()!.visibilityChange,
      'emit'
    ).and.callThrough();
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });

  it('should close on ESC press', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    popover.dispatchEvent(generateKeyEvent('Escape'));
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeFalsy();
  });

  it('should close on outside click', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    document.body.click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeFalsy();
  });

  it('should not close if click starts on the popover', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    popover.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeTruthy();
  });

  it('should not close if click ends on the popover', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    popover.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeTruthy();
  });

  it('should focus on the popover wrapper', async () => {
    jasmine.clock().install();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();
    expect(popover.innerHTML).toContain('test popover content');

    jasmine.clock().tick(10);
    await fixture.whenStable();

    expect(document.activeElement).toBe(document.querySelector('.popover'));

    jasmine.clock().uninstall();
  });
});

describe('with custom template', () => {
  let fixture: ComponentFixture<CustomTemplateHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(CustomTemplateHostComponent);
  });

  it('should focus on the first interactive element', async () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeTruthy();

    await new Promise(r => setTimeout(r, 10)); // wait for focus to settle

    expect(document.activeElement).toBe(document.querySelector('#input-1'));
  });
});
