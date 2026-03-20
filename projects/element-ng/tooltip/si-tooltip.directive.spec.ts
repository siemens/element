/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiTooltipModule } from './si-tooltip.module';

describe('SiTooltipDirective', () => {
  describe('with text', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button type="button" [siTooltip]="tooltipText" [isDisabled]="isDisabled">
        Test
      </button>`
    })
    class TestHostComponent {
      isDisabled = false;
      tooltipText = 'test tooltip';
    }

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SiTooltipModule, TestHostComponent]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      spyOn(button, 'matches').and.returnValue(true);
      fixture.detectChanges();
    });

    it('should open on focus', () => {
      button.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(document.querySelector('.tooltip')).toBeTruthy();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('test tooltip');

      button.dispatchEvent(new Event('focusout'));

      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should not show tooltip when disabled', () => {
      component.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      button.dispatchEvent(new Event('focus'));
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should show tooltip on mouse over', () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      // tooltip DOM is created immediately, CSS transition-delay handles visual delay
      expect(document.querySelector('.tooltip')).toBeTruthy();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should update tooltip content while open', () => {
      button.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('test tooltip');

      component.tooltipText = 'updated tooltip';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(document.querySelector('.tooltip')?.innerHTML).toContain('updated tooltip');
    });
  });

  describe('with template', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: ` <button type="button" [siTooltip]="template" [tooltipContext]="tooltipContext"
          >Test</button
        >
        <ng-template #template let-tooltip="tooltip">Template content {{ tooltip }}</ng-template>`
    })
    class TestHostComponent {
      tooltipContext = {};
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      spyOn(button, 'matches').and.returnValue(true);
      fixture.detectChanges();
    });

    it('should render the template', async () => {
      button.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('Template content');
      button.dispatchEvent(new Event('focusout'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should render the template with context', async () => {
      fixture.componentInstance.tooltipContext = { tooltip: 'test' };
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      button.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('Template content test');
      button.dispatchEvent(new Event('focusout'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });
  });
});
