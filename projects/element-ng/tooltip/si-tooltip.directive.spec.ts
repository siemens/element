/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { SiTooltipModule } from './si-tooltip.module';

describe('SiTooltipDirective', () => {
  describe('with text', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: `<button
        type="button"
        siTooltip="test tooltip"
        [isDisabled]="isDisabled"
        [triggers]="triggers"
        >Test</button
      >`
    })
    class TestHostComponent {
      isDisabled = false;
      triggers: '' | 'focus' = '';
    }

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SiTooltipModule, TestHostComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      fixture.detectChanges();
    });

    it('should open on focus', fakeAsync(() => {
      fixture.detectChanges();

      button.dispatchEvent(new Event('focus'));
      flush();

      expect(document.querySelector('.tooltip')).toBeTruthy();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('test tooltip');

      button.dispatchEvent(new Event('focusout'));
      flush();

      expect(document.querySelector('.tooltip')).toBeFalsy();
    }));

    it('should not show tooltip when disabled', () => {
      component.isDisabled = true;
      fixture.detectChanges();

      button.dispatchEvent(new Event('focus'));
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should show tooltip on mouse over', () => {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.querySelector('.tooltip')).toBeTruthy();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });

    it('should not show tooltip on mouse over with focus trigger', () => {
      component.triggers = 'focus';
      fixture.detectChanges();

      ['mouseenter', 'mouseleave'].forEach(e => {
        button.dispatchEvent(new MouseEvent(e));
        expect(document.querySelector('.tooltip')).toBeFalsy();
      });
    });
  });

  describe('with template', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let button: HTMLButtonElement;

    @Component({
      imports: [SiTooltipModule],
      template: ` <button type="button" [siTooltip]="template">Test</button>
        <ng-template #template let-tooltip>Template content</ng-template>`
    })
    class TestHostComponent {}

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      fixture.detectChanges();
    });

    it('should render the template', async () => {
      fixture.detectChanges();
      button.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')?.innerHTML).toContain('Template content');
      button.dispatchEvent(new Event('focusout'));
      await fixture.whenStable();
      expect(document.querySelector('.tooltip')).toBeFalsy();
    });
  });
});
