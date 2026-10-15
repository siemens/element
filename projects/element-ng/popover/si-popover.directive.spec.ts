/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { defaultConnectedOverlayScrollStrategy } from '@siemens/element-ng/common';
import { page, userEvent } from 'vitest/browser';

import { SiPopoverTitleDirective } from './si-popover-title.directive';
import { SiPopoverDirective } from './si-popover.directive';

const generateKeyEvent = (key: string): KeyboardEvent => {
  const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'key', { value: key });
  return event;
};

@Component({
  imports: [SiPopoverDirective],
  template: `
    <button type="button" siPopover="test popover content" [siPopoverTitle]="title()">Test</button>
  `
})
export class HostComponent {
  readonly title = signal('');
  readonly popoverOverlay = viewChild(SiPopoverDirective);
}

@Component({
  imports: [SiPopoverDirective],
  template: `
    <button type="button" siPopover="test popover content" [id]="triggerId()">Test with ID</button>
  `
})
class HostWithIdComponent {
  readonly triggerId = signal('existing-trigger');
}

@Component({
  imports: [SiPopoverDirective, SiPopoverTitleDirective],
  template: `
    <button type="button" [siPopover]="popoverTemplate">Test with custom template</button>
    <ng-template #popoverTemplate>
      @if (showTitle()) {
        <si-popover-title>Custom title</si-popover-title>
      }
      <div class="popover-content">
        <label>
          Input
          <input class="form-control" type="text" id="input-1" />
        </label>
        <button type="button" id="button-1">Button 1</button>
      </div>
    </ng-template>
  `
})
export class CustomTemplateHostComponent {
  readonly showTitle = signal(false);
}

describe('SiPopoverNextDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let wrapperComponent: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should use the trigger as the dialog label when no title is provided', async () => {
    await fixture.whenStable();
    const button = page.getByRole('button', { name: 'Test' });
    await expect.element(button).toHaveAttribute('id', expect.stringMatching(/\S+/));

    await userEvent.click(button);
    await fixture.whenStable();

    await expect
      .element(page.getByRole('dialog', { name: 'Test' }))
      .toHaveAttribute('aria-labelledby', button.element().id);
  });

  it('should preserve an existing trigger ID when using it as the label', async () => {
    const idFixture = TestBed.createComponent(HostWithIdComponent);
    await idFixture.whenStable();
    const button = page.getByRole('button', { name: 'Test with ID' });

    await userEvent.click(button);
    await idFixture.whenStable();

    await expect.element(button).toHaveAttribute('id', 'existing-trigger');
    await expect
      .element(page.getByRole('dialog', { name: 'Test with ID' }))
      .toHaveAttribute('aria-labelledby', 'existing-trigger');
  });

  it('should update the dialog label reference when the bound trigger ID changes', async () => {
    const idFixture = TestBed.createComponent(HostWithIdComponent);
    await idFixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Test with ID' }));
    await idFixture.whenStable();

    idFixture.componentInstance.triggerId.set('updated-trigger');
    await idFixture.whenStable();

    await expect
      .element(page.getByRole('button', { name: 'Test with ID' }))
      .toHaveAttribute('id', 'updated-trigger');
    await expect
      .element(page.getByRole('dialog', { name: 'Test with ID' }))
      .toHaveAttribute('aria-labelledby', 'updated-trigger');
  });

  it('should preserve a static trigger ID', async () => {
    @Component({
      imports: [SiPopoverDirective],
      template: `<button type="button" id="static-trigger" siPopover="test">Static ID</button>`
    })
    class StaticIdHostComponent {}

    const idFixture = TestBed.createComponent(StaticIdHostComponent);
    await idFixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Static ID' }));
    await idFixture.whenStable();

    await expect
      .element(page.getByRole('button', { name: 'Static ID' }))
      .toHaveAttribute('id', 'static-trigger');
    await expect
      .element(page.getByRole('dialog', { name: 'Static ID' }))
      .toHaveAttribute('aria-labelledby', 'static-trigger');
  });

  it('should prefer the provided title over the trigger label', async () => {
    wrapperComponent.title.set('Popover title');
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();

    await expect
      .element(page.getByRole('dialog', { name: 'Popover title' }))
      .toHaveAttribute(
        'aria-labelledby',
        page.getByText('Popover title', { exact: true }).element().id
      );
  });

  it('should update the label when the provided title changes', async () => {
    await fixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Test' }));
    await fixture.whenStable();

    wrapperComponent.title.set('Popover title');
    await fixture.whenStable();
    await expect.element(page.getByRole('dialog', { name: 'Popover title' })).toBeInTheDocument();

    wrapperComponent.title.set('');
    await fixture.whenStable();
    await expect.element(page.getByRole('dialog', { name: 'Test' })).toBeInTheDocument();
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

  it('should use the trigger label when the template has no title', async () => {
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Test with custom template' }));
    await fixture.whenStable();

    await expect
      .element(page.getByRole('dialog', { name: 'Test with custom template' }))
      .toBeInTheDocument();
  });

  it('should prefer a template title and fall back to the trigger when it is removed', async () => {
    fixture.componentInstance.showTitle.set(true);
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Test with custom template' }));
    await fixture.whenStable();

    await expect
      .element(page.getByRole('dialog', { name: 'Custom title' }))
      .toHaveAttribute(
        'aria-labelledby',
        page.getByText('Custom title', { exact: true }).element().id
      );

    fixture.componentInstance.showTitle.set(false);
    await fixture.whenStable();

    await expect
      .element(page.getByRole('dialog', { name: 'Test with custom template' }))
      .toBeInTheDocument();
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
    </button>`
  })
  class ScrollStrategyHostComponent {
    readonly scrollStrategy = signal(defaultConnectedOverlayScrollStrategy());
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

  it('should reopen popover after the close scroll strategy detached it', async () => {
    const overlay = TestBed.inject(Overlay);
    fixture.componentInstance.scrollStrategy.set(overlay.scrollStrategies.close());
    await fixture.whenStable();
    const button = page.getByRole('button', { name: 'Test' });

    await userEvent.click(button);
    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    await fixture.whenStable();

    await userEvent.click(button);

    expect(document.querySelector('.popover')).toBeInTheDocument();
    await expect.element(button).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(button);
  });
});
