/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { SiTooltipModule } from './si-tooltip.module';

describe('SiTooltipDirective', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setTimerTickMode('nextTimerAsync');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('with text', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button type="button" [siTooltip]="tooltipText()" [isDisabled]="isDisabled()">
        Test
      </button>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {
      readonly isDisabled = signal(false);
      readonly tooltipText = signal('test tooltip');
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      vi.spyOn(button, 'matches').mockImplementation(selector => selector === ':focus-visible');
      fixture.detectChanges();
    });

    it('should open on focus', async () => {
      button.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(0);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).toBeInTheDocument();
      expect(document.querySelector('.tooltip')).toHaveTextContent('test tooltip');

      button.dispatchEvent(new FocusEvent('focusout'));
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should not show tooltip when disabled', async () => {
      component.isDisabled.set(true);
      await fixture.whenStable();

      button.dispatchEvent(new FocusEvent('focus'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should cancel pending tooltip when disabled while waiting', async () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      await vi.advanceTimersByTimeAsync(0);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();

      component.isDisabled.set(true);
      await fixture.whenStable();

      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should show tooltip on mouse over', async () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeInTheDocument();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should cancel the pending hover tooltip on focusout', async () => {
      vi.setTimerTickMode('manual');
      await userEvent.hover(button);
      vi.advanceTimersByTime(250);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();

      // focusout (e.g. user switched to keyboard navigation) must stop the
      // pending hover timer so the tooltip never appears.
      button.dispatchEvent(new Event('focusout'));
      vi.advanceTimersByTime(500);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should hide a hover-visible tooltip on focusout', async () => {
      await userEvent.hover(button);
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeInTheDocument();

      button.dispatchEvent(new Event('focusout'));

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should hide the tooltip on touchstart', async () => {
      await userEvent.hover(button);
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeInTheDocument();

      button.dispatchEvent(new Event('touchstart'));

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should update tooltip content while open', async () => {
      button.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(0);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('test tooltip');

      component.tooltipText.set('updated tooltip');
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).toHaveTextContent('updated tooltip');
    });
  });

  describe('with template', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button type="button" [siTooltip]="template" [tooltipContext]="tooltipContext()">
          Test
        </button>
        <ng-template #template let-tooltip="tooltip">Template content {{ tooltip }}</ng-template>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {
      readonly tooltipContext = signal<Record<string, unknown>>({});
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      vi.spyOn(button, 'matches').mockImplementation(selector => selector === ':focus-visible');
      fixture.detectChanges();
    });

    it('should render the template', async () => {
      button.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('Template content');
      button.dispatchEvent(new FocusEvent('focusout'));
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should render the template with context', async () => {
      fixture.componentInstance.tooltipContext.set({ tooltip: 'test' });
      await fixture.whenStable();
      button.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('Template content test');
      button.dispatchEvent(new FocusEvent('focusout'));
      await vi.advanceTimersByTimeAsync(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });
  });

  describe('with scrollStrategy', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button type="button" siTooltip="test" [tooltipScrollStrategy]="scrollStrategy()"
        >Test</button
      >`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {
      readonly scrollStrategy = signal<ScrollStrategy | undefined>(undefined);
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      vi.spyOn(button, 'matches').mockImplementation(selector => selector === ':focus-visible');
      fixture.detectChanges();
    });

    it('should close tooltip on scroll when custom close scroll strategy is provided', async () => {
      const overlay = TestBed.inject(Overlay);
      fixture.componentInstance.scrollStrategy.set(overlay.scrollStrategies.close());
      await fixture.whenStable();

      button.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(0);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).toBeInTheDocument();

      document.dispatchEvent(new Event('scroll', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(0);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });
  });
});
