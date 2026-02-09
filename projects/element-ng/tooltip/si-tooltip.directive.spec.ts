/**
 * Copyright (c) Siemens 2016 - 2025
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
      jasmine.clock().install();
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      fixture.detectChanges();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should open on focus', () => {
      button.dispatchEvent(new Event('focus'));
      // Focus should be immediate (no delay) but still need to tick for setTimeout(0)
      jasmine.clock().tick(0);
      fixture.detectChanges();

      expect(document.querySelector('.tooltip')).toBeTruthy();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('test tooltip');

      button.dispatchEvent(new Event('focusout'));
      jasmine.clock().tick(500);

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
      // hover should have 500ms delay
      expect(document.querySelector('.tooltip')).toBeFalsy();

      jasmine.clock().tick(500);
      fixture.detectChanges();
      expect(document.querySelector('.tooltip')).toBeTruthy();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should update tooltip content while open', () => {
      button.dispatchEvent(new Event('focus'));
      jasmine.clock().tick(0);
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
      jasmine.clock().install();
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      fixture.detectChanges();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should render the template', async () => {
      button.dispatchEvent(new Event('focus'));
      jasmine.clock().tick(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('Template content');
      button.dispatchEvent(new Event('focusout'));
      jasmine.clock().tick(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should render the template with context', async () => {
      fixture.componentInstance.tooltipContext = { tooltip: 'test' };
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      button.dispatchEvent(new Event('focus'));
      jasmine.clock().tick(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('Template content test');
      button.dispatchEvent(new Event('focusout'));
      jasmine.clock().tick(500);
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });
  });
});
