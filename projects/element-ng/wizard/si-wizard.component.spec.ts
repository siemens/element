/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResizeObserverService, SiResizeObserverModule } from '@siemens/element-ng/resize-observer';

import { runOnPushChangeDetection } from '../test-helpers/change-detection.helper';
import { SiWizardStepComponent, SiWizardComponent as TestComponent } from './index';

@Component({
  imports: [TestComponent, SiResizeObserverModule, SiWizardStepComponent],
  template: `
    <si-wizard
      #wizard
      [hasCancel]="hasCancel"
      [hasNavigation]="hasNavigation"
      [inlineNavigation]="inlineNavigation"
      [verticalLayout]="verticalLayout()"
      [showVerticalDivider]="showVerticalDivider()"
      [verticalMinSize]="verticalMinSize()"
      [verticalMaxSize]="verticalMaxSize()"
    >
      @for (step of steps; track step) {
        <si-wizard-step [heading]="step" />
      }
    </si-wizard>
  `,
  styles: `
    :host {
      display: block;
      width: 1200px;
    }
  `
})
class TestHostComponent {
  steps!: string[];
  hasCancel = false;
  hasNavigation = true;
  inlineNavigation = true;
  readonly showVerticalDivider = input(false);
  readonly verticalLayout = input(false);
  readonly verticalMinSize = input<string>();
  readonly verticalMaxSize = input<string>();
  readonly wizard = viewChild.required(TestComponent);

  constructor() {
    this.generateSteps(3);
  }

  generateSteps(amount: number): void {
    this.steps = new Array(amount).fill(1).map((value, index) => `Step ${index + 1}`);
  }
}

describe('SiWizardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: TestComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiResizeObserverModule, TestHostComponent]
    })
  );

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.componentInstance.wizard();
    element = fixture.nativeElement.querySelector('si-wizard');
    fixture.detectChanges();
    TestBed.inject(ResizeObserverService)._checkAll();
    flush();
    tick();
    fixture.detectChanges();
    tick();
  }));

  it('stepCount should match number of steps', () => {
    expect(component.stepCount).toBe(hostComponent.steps.length);
  });

  it('should center activated step', () => {
    fixture.componentInstance.generateSteps(10);
    fixture.detectChanges();
    // Activate last step
    const steps = fixture.debugElement.queryAll(By.css('.step a'));
    steps.at(-1)?.nativeElement.click();
    fixture.detectChanges();
    // Check that the middle step is active
    const updatedSteps = fixture.debugElement.queryAll(By.css('.step a'));
    const middleStep = updatedSteps.at(updatedSteps.length / 2);
    expect(middleStep?.attributes['aria-current']).toBeTruthy();
  });

  describe('when default step loads', () => {
    it('should be created with default values', () => {
      expect(component.backText()).toEqual('Back');
      expect(component.nextText()).toEqual('Next');
      expect(component.saveText()).toEqual('Save');
    });

    it('should generate a link with a heading for each step', () => {
      const steps = element.querySelectorAll('.step');
      expect(steps.length).toBe(3);
      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].querySelector('.title')!.textContent).toEqual(
          fixture.componentInstance.steps[i]
        );
      }
    });

    it('should only show next button', () => {
      expect(element.querySelector('.wizard-btn-container .back')).toHaveClass('invisible');
      expect(element.querySelector('.wizard-btn-container .next')).not.toHaveClass('invisible');
    });

    it('active step should have aria-current set on first step', () => {
      expect(element.querySelector('a.active')?.getAttribute('aria-current')).toBe('step');
      expect(element.querySelector('a.active .title')?.textContent).toBe('Step 1');
      expect(element.querySelector('.step:nth-child(2) a')?.getAttribute('aria-current')).toBe(
        'false'
      );
      expect(element.querySelector('.step:nth-child(3) a')?.getAttribute('aria-current')).toBe(
        'false'
      );
    });
  });

  describe('when next button is clicked', () => {
    beforeEach(() => {
      element.querySelector<HTMLElement>('.next')!.click();
      fixture.detectChanges();
    });

    it('should show back and next buttons', () => {
      expect(element.querySelector('.wizard-btn-container .back')).not.toHaveClass('invisible');
      expect(element.querySelector('.wizard-btn-container .next')).not.toHaveClass('invisible');
    });

    it('should hide save button', () => {
      expect(element.querySelector('.btn.save')).toBeFalsy();
    });

    it('active step should have aria-current set on middle step', () => {
      expect(element.querySelector('a.active')?.getAttribute('aria-current')).toBe('step');
      expect(element.querySelector('a.active .title')?.textContent).toBe('Step 2');
      expect(element.querySelector('.step:nth-child(1) a')?.getAttribute('aria-current')).toBe(
        'false'
      );
      expect(element.querySelector('.step:nth-child(3) a')?.getAttribute('aria-current')).toBe(
        'false'
      );
    });

    describe('when back button is clicked', () => {
      beforeEach(() => {
        element.querySelector<HTMLElement>('.back')!.click();
        fixture.detectChanges();
      });

      it('should show next button', () => {
        expect(element.querySelector('.wizard-btn-container .next')).not.toHaveClass('invisible');
      });

      it('should hide save and back button', () => {
        expect(element.querySelector('.btn.save')).toBeFalsy();
        expect(element.querySelector('.wizard-btn-container .back')).toHaveClass('invisible');
      });

      it('active step should have aria-current back to first step', () => {
        expect(element.querySelector('a.active')?.getAttribute('aria-current')).toBe('step');
        expect(element.querySelector('a.active .title')?.textContent).toBe('Step 1');
        expect(element.querySelector('.step:nth-child(2) a')?.getAttribute('aria-current')).toBe(
          'false'
        );
        expect(element.querySelector('.step:nth-child(3) a')?.getAttribute('aria-current')).toBe(
          'false'
        );
      });
    });

    it('should reset index if current item is removed', () => {
      fixture.componentInstance.steps = ['Other Step'];
      fixture.detectChanges();
      expect(element.querySelector('.back.invisible')).toBeTruthy();
      expect(element.querySelector('a.active .title')?.textContent).toBe('Other Step');
    });

    it('should update the index if an item was moved', () => {
      fixture.componentInstance.steps = ['other step', 'and another', 'Step 2'];
      fixture.detectChanges();
      expect(element.querySelector('a.active .title')?.textContent).toBe('Step 2');
    });

    describe('when current step is the last one', () => {
      beforeEach(() => {
        const steps = element.querySelectorAll<HTMLElement>('.step a');
        steps[steps.length - 1].click();
        fixture.detectChanges();
      });

      it('should show save and back button', () => {
        expect(element.querySelector('.btn.save')).toBeTruthy();
        expect(element.querySelector('.wizard-btn-container .back')).not.toHaveClass('invisible');
      });

      it('should hide next button', () => {
        expect(element.querySelector('.wizard-btn-container .next')).toHaveClass('invisible');
      });

      it('should output on click of save button', () => {
        spyOn(component.completionAction, 'emit');
        element.querySelector<HTMLElement>('.btn.save')!.click();
        expect(component.completionAction.emit).toHaveBeenCalled();
      });

      it('active step should have aria-current on last step', () => {
        expect(element.querySelector('a.active')?.getAttribute('aria-current')).toBe('step');
        expect(element.querySelector('a.active .title')?.textContent).toBe('Step 3');
        expect(element.querySelector('.step:nth-child(1) a')?.getAttribute('aria-current')).toBe(
          'false'
        );
        expect(element.querySelector('.step:nth-child(2) a')?.getAttribute('aria-current')).toBe(
          'false'
        );
      });
    });
  });

  describe('cancel button', () => {
    it('should not contain cancel button', () => {
      fixture.detectChanges();
      expect(element.querySelectorAll('[aria-label="Cancel"]')).toHaveSize(0);
    });

    it('should contain cancel button', () => {
      fixture.componentInstance.hasCancel = true;
      fixture.detectChanges();
      expect(element.querySelectorAll('[aria-label="Cancel"]')).toHaveSize(1);
    });
  });

  it('should calculate visible items', fakeAsync(() => {
    fixture.componentInstance.generateSteps(10);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(element.querySelectorAll('.container-steps .step').length).toBe(7);
    element.querySelector<HTMLElement>('.next')!.click();
    tick();
    fixture.detectChanges();
  }));

  describe('without navigation button', () => {
    beforeEach(async () => {
      hostComponent.hasNavigation = false;
      await runOnPushChangeDetection(fixture);
    });

    it('should not show navigation buttons', () => {
      expect(element.querySelector('.wizard-btn-container .back')).toBeFalsy();
      expect(element.querySelector('.wizard-btn-container .next')).toBeFalsy();
    });

    it('should go to next step without navigation buttons', () => {
      component.next();
      expect(component.index).toBe(1);
      fixture.detectChanges();
      expect(element.querySelector('.wizard-btn-container .back')).toBeFalsy();
      expect(element.querySelector('.wizard-btn-container .next')).toBeFalsy();
    });

    it('should go to previous step without navigation buttons', () => {
      // Move step 2
      component.next();
      expect(component.index).toBe(1);
      fixture.detectChanges();

      // Move back
      component.back();
      expect(component.index).toBe(0);
      fixture.detectChanges();
      expect(element.querySelector('.wizard-btn-container .back')).toBeFalsy();
      expect(element.querySelector('.wizard-btn-container .next')).toBeFalsy();
    });
  });

  describe('navigation buttons in footer', () => {
    it('should not show navigation buttons inline if inlineNavigation is false', async () => {
      hostComponent.inlineNavigation = false;
      await runOnPushChangeDetection(fixture);
      expect(element.querySelector('.container-wizard .wizard-btn-container .next')).toBeFalsy();
    });

    it('should show navigation buttons inline if inlineNavigation is true', async () => {
      hostComponent.inlineNavigation = true;
      await runOnPushChangeDetection(fixture);
      expect(element.querySelector('.container-wizard .wizard-btn-container .next')).toBeTruthy();
    });
  });

  describe('steps with lazy loading', () => {
    it('should render steps if they are loaded lazily', fakeAsync(() => {
      fixture.componentInstance.steps = [];
      fixture.detectChanges();
      const steps = element.querySelectorAll('.step');
      expect(steps.length).toBe(0);
      setTimeout(() => {
        fixture.componentInstance.generateSteps(3);
        fixture.detectChanges();
      }, 100);
      tick(100);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const updatedSteps = element.querySelectorAll('.step');
        expect(updatedSteps.length).toBe(3);
      });
    }));
  });

  describe('use vertical layout', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('verticalLayout', true);
    });

    it('should use verticalMinSize for step container min-inline-size', () => {
      fixture.componentRef.setInput('verticalMinSize', '100px');
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.container-steps.vertical'));
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.minInlineSize).toBe('100px');
    });

    it('should use verticalMaxSize for step container max-inline-size', () => {
      fixture.componentRef.setInput('verticalMaxSize', '100px');
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.container-steps.vertical'));
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.maxInlineSize).toBe('100px');
    });

    it('should have divider to visually separate content and steps when showVerticalDivider is set to true', () => {
      fixture.componentRef.setInput('showVerticalDivider', true);
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.vertical-divider'));
      expect(container).toBeTruthy();
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.borderRight).toBeTruthy();
    });

    it('should not have divider when showVerticalDivider is set to false', () => {
      fixture.componentRef.setInput('showVerticalDivider', false);
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.vertical-divider'));
      expect(container).toBeFalsy();
    });
  });
});
