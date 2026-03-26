/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiTooltipModule } from './si-tooltip.module';

describe('SiTooltipDirective', () => {
  describe('with text', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button type="button" [siTooltip]="tooltipText()" [isDisabled]="isDisabled()">
        Test
      </button>`
    })
    class TestHostComponent {
      readonly isDisabled = signal(false);
      readonly tooltipText = signal('test tooltip');
    }

    beforeEach(() => {
      vi.useFakeTimers();
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      vi.spyOn(button, 'matches').mockReturnValue(true);
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should open on focus', async () => {
      button.dispatchEvent(new Event('focus'));
      // Focus should be immediate (no delay) but still need to tick for setTimeout(0)
      vi.advanceTimersByTime(0);
      await fixture.whenStable();

      expect(document.querySelector('.tooltip')).toBeInTheDocument();
      expect(document.querySelector('.tooltip')).toHaveTextContent('test tooltip');

      button.dispatchEvent(new Event('focusout'));
      vi.advanceTimersByTime(500);

      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should not show tooltip when disabled', () => {
      component.isDisabled.set(true);
      fixture.detectChanges();

      button.dispatchEvent(new Event('focus'));
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should show tooltip on mouse over', async () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      // hover should have 500ms delay
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();

      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeInTheDocument();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should update tooltip content while open', async () => {
      button.dispatchEvent(new Event('focus'));
      vi.advanceTimersByTime(0);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('test tooltip');

      component.tooltipText.set('updated tooltip');
      fixture.detectChanges();

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
        <ng-template #template let-tooltip="tooltip">Template content {{ tooltip }}</ng-template>`
    })
    class TestHostComponent {
      readonly tooltipContext = signal<Record<string, unknown>>({});
    }

    beforeEach(() => {
      vi.useFakeTimers();
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      vi.spyOn(button, 'matches').mockReturnValue(true);
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render the template', async () => {
      button.dispatchEvent(new Event('focus'));
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('Template content');
      button.dispatchEvent(new Event('focusout'));
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });

    it('should render the template with context', async () => {
      fixture.componentInstance.tooltipContext.set({ tooltip: 'test' });
      fixture.detectChanges();
      button.dispatchEvent(new Event('focus'));
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toHaveTextContent('Template content test');
      button.dispatchEvent(new Event('focusout'));
      vi.advanceTimersByTime(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).not.toBeInTheDocument();
    });
  });
});
