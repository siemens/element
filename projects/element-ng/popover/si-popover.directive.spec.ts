/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { SiPopoverDirective } from './si-popover.directive';

const generateKeyEvent = (key: string): KeyboardEvent => {
  const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

@Component({
  imports: [SiPopoverDirective],
  template: `<button type="button" siPopover="test popover content">Test</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostComponent {
  readonly popoverOverlay = viewChild(SiPopoverDirective);
}

@Component({
  imports: [SiPopoverDirective],
  template: `
    <button type="button" [siPopover]="popoverTemplate">Test with custom template</button>
    <ng-template #popoverTemplate>
      <div class="popover-content">
        <label>
          Input
          <input class="form-control" type="text" id="input-1" />
        </label>
        <button type="button" id="button-1">Button 1</button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTemplateHostComponent {}

describe('SiPopoverNextDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let wrapperComponent: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should open/close on click', async () => {
    await fixture.whenStable();
    const toggleButton = page.getByRole('button', { name: 'Test' });
    await userEvent.click(toggleButton);

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    // Closes on button click
    await userEvent.click(toggleButton);

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should not emit hidden event if popover overlay is closed', () => {
    const hiddenSpy = vi.spyOn(wrapperComponent.popoverOverlay()!.visibilityChange, 'emit');
    wrapperComponent.popoverOverlay()?.hide();
    expect(hiddenSpy).not.toHaveBeenCalled();
  });

  it('should close on ESC press', async () => {
    await fixture.whenStable();
    const toggleButton = page.getByRole('button', { name: 'Test' });
    await userEvent.click(toggleButton);

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    popover.dispatchEvent(generateKeyEvent('Escape'));
    await fixture.whenStable();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should close on outside click', async () => {
    await fixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    document.body.click();
    await fixture.whenStable();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });

  it('should not close if click starts on the popover', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fixture.detectChanges();

    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    popover.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    vi.advanceTimersByTime(10);
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should not close if click ends on the popover', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fixture.detectChanges();

    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    popover.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true }));
    vi.advanceTimersByTime(10);
    await fixture.whenStable();

    expect(document.querySelector('.popover')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should focus on the popover wrapper', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fixture.detectChanges();

    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();

    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('test popover content');

    vi.advanceTimersByTime(10);
    await fixture.whenStable();

    expect(document.activeElement).toBe(document.querySelector('.popover'));

    vi.useRealTimers();
  });
});

describe('with custom template', () => {
  let fixture: ComponentFixture<CustomTemplateHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateHostComponent);
  });

  it('should focus on the first interactive element', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fixture.detectChanges();

    await userEvent.click(page.getByRole('button', { name: 'Test with custom template' }));
    await fixture.whenStable();
    const popover = document.querySelector('.popover')!;
    expect(popover).toBeInTheDocument();

    vi.advanceTimersByTime(10);
    await fixture.whenStable();

    await expect.element(page.getByRole('textbox', { name: 'Input' })).toHaveFocus();
    vi.useRealTimers();
  });
});

describe('with scrollStrategy', () => {
  let fixture: ComponentFixture<ScrollStrategyHostComponent>;

  @Component({
    imports: [SiPopoverDirective],
    template: `<button type="button" siPopover="test" [siPopoverScrollStrategy]="scrollStrategy()">
      Test
    </button>`,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  class ScrollStrategyHostComponent {
    readonly scrollStrategy = signal<ScrollStrategy | undefined>(undefined);
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollStrategyHostComponent);
    fixture.detectChanges();
  });

  it('should close popover on scroll when custom close scroll strategy is provided', async () => {
    const overlay = TestBed.inject(Overlay);
    fixture.componentInstance.scrollStrategy.set(overlay.scrollStrategies.close());
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    expect(document.querySelector('.popover')).toBeInTheDocument();

    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    await fixture.whenStable();

    expect(document.querySelector('.popover')).not.toBeInTheDocument();
  });
});
