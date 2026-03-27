/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';

import { SiWizardStepComponent, SiWizardComponent as TestComponent } from './index';

@Component({
  imports: [TestComponent, SiResizeObserverModule, SiWizardStepComponent],
  template: `
    <si-wizard
      #wizard
      [hasCancel]="hasCancel()"
      [hideNavigation]="hideNavigation()"
      [inlineNavigation]="inlineNavigation()"
      [verticalLayout]="verticalLayout()"
      [showVerticalDivider]="showVerticalDivider()"
      [verticalMinSize]="verticalMinSize()"
      [verticalMaxSize]="verticalMaxSize()"
    >
      @for (step of steps(); track step) {
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
  readonly steps = signal<string[]>([]);
  readonly hasCancel = signal(false);
  readonly hideNavigation = signal(false);
  readonly inlineNavigation = signal(true);
  readonly showVerticalDivider = signal(false);
  readonly verticalLayout = signal(false);
  readonly verticalMinSize = signal<string | undefined>(undefined);
  readonly verticalMaxSize = signal<string | undefined>(undefined);
  readonly wizard = viewChild.required(TestComponent);

  constructor() {
    this.generateSteps(3);
  }

  generateSteps(amount: number): void {
    this.steps.set(new Array(amount).fill(1).map((value, index) => `Step ${index + 1}`));
  }
}

describe('SiWizardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: TestComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.componentInstance.wizard();
    element = fixture.nativeElement.querySelector('si-wizard');
    fixture.detectChanges();
  });

  it('stepCount should match number of steps', () => {
    expect(component.stepCount).toBe(hostComponent.steps().length);
  });

  it('should center activated step', async () => {
    hostComponent.generateSteps(10);
    await fixture.whenStable();
    // Activate last step
    const steps = fixture.debugElement.queryAll(By.css('.step a'));
    steps.at(-1)?.nativeElement.click();
    await fixture.whenStable();
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
        expect(steps[i].querySelector<HTMLElement>('.title')).toHaveTextContent(
          hostComponent.steps()[i]
        );
      }
    });

    it('should only show next button', () => {
      expect(element.querySelector<HTMLElement>('.wizard-btn-container .back')).toHaveClass(
        'invisible'
      );
      expect(element.querySelector<HTMLElement>('.wizard-btn-container .next')).not.toHaveClass(
        'invisible'
      );
    });

    it('active step should have aria-current set on first step', () => {
      expect(element.querySelector<HTMLElement>('a.active')).toHaveAttribute(
        'aria-current',
        'step'
      );
      expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Step 1');
      expect(element.querySelector<HTMLElement>('.step:nth-child(2) a')).toHaveAttribute(
        'aria-current',
        'false'
      );
      expect(element.querySelector<HTMLElement>('.step:nth-child(3) a')).toHaveAttribute(
        'aria-current',
        'false'
      );
    });
  });

  describe('when next button is clicked', () => {
    beforeEach(async () => {
      element.querySelector<HTMLElement>('.next')!.click();
      await fixture.whenStable();
    });

    it('should show back and next buttons', () => {
      expect(element.querySelector<HTMLElement>('.wizard-btn-container .back')).not.toHaveClass(
        'invisible'
      );
      expect(element.querySelector<HTMLElement>('.wizard-btn-container .next')).not.toHaveClass(
        'invisible'
      );
    });

    it('should hide save button', () => {
      expect(element.querySelector<HTMLElement>('.btn.save')).not.toBeInTheDocument();
    });

    it('active step should have aria-current set on middle step', () => {
      expect(element.querySelector<HTMLElement>('a.active')).toHaveAttribute(
        'aria-current',
        'step'
      );
      expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Step 2');
      expect(element.querySelector<HTMLElement>('.step:nth-child(1) a')).toHaveAttribute(
        'aria-current',
        'false'
      );
      expect(element.querySelector<HTMLElement>('.step:nth-child(3) a')).toHaveAttribute(
        'aria-current',
        'false'
      );
    });

    describe('when back button is clicked', () => {
      beforeEach(async () => {
        element.querySelector<HTMLElement>('.back')!.click();
        await fixture.whenStable();
      });

      it('should show next button', () => {
        expect(element.querySelector<HTMLElement>('.wizard-btn-container .next')).not.toHaveClass(
          'invisible'
        );
      });

      it('should hide save and back button', () => {
        expect(element.querySelector<HTMLElement>('.btn.save')).not.toBeInTheDocument();
        expect(element.querySelector<HTMLElement>('.wizard-btn-container .back')).toHaveClass(
          'invisible'
        );
      });

      it('active step should have aria-current back to first step', () => {
        expect(element.querySelector<HTMLElement>('a.active')).toHaveAttribute(
          'aria-current',
          'step'
        );
        expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Step 1');
        expect(element.querySelector<HTMLElement>('.step:nth-child(2) a')).toHaveAttribute(
          'aria-current',
          'false'
        );
        expect(element.querySelector<HTMLElement>('.step:nth-child(3) a')).toHaveAttribute(
          'aria-current',
          'false'
        );
      });
    });

    it('should reset index if current item is removed', async () => {
      hostComponent.steps.set(['Other Step']);
      await fixture.whenStable();
      expect(element.querySelector<HTMLElement>('.back.invisible')).toBeInTheDocument();
      expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Other Step');
    });

    it('should update the index if an item was moved', async () => {
      hostComponent.steps.set(['other step', 'and another', 'Step 2']);
      await fixture.whenStable();
      expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Step 2');
    });

    describe('when current step is the last one', () => {
      beforeEach(async () => {
        const steps = element.querySelectorAll<HTMLElement>('.step a');
        steps[steps.length - 1].click();

        await fixture.whenStable();
      });

      it('should show save and back button', () => {
        expect(element.querySelector<HTMLElement>('.btn.save')).toBeInTheDocument();
        expect(element.querySelector<HTMLElement>('.wizard-btn-container .back')).not.toHaveClass(
          'invisible'
        );
      });

      it('should hide next button', () => {
        expect(element.querySelector<HTMLElement>('.wizard-btn-container .next')).toHaveClass(
          'invisible'
        );
      });

      it('should output on click of save button', () => {
        vi.spyOn(component.completionAction, 'emit');
        element.querySelector<HTMLElement>('.btn.save')!.click();
        expect(component.completionAction.emit).toHaveBeenCalled();
      });

      it('active step should have aria-current on last step', () => {
        expect(element.querySelector<HTMLElement>('a.active')).toHaveAttribute(
          'aria-current',
          'step'
        );
        expect(element.querySelector<HTMLElement>('a.active .title')).toHaveTextContent('Step 3');
        expect(element.querySelector<HTMLElement>('.step:nth-child(1) a')).toHaveAttribute(
          'aria-current',
          'false'
        );
        expect(element.querySelector<HTMLElement>('.step:nth-child(2) a')).toHaveAttribute(
          'aria-current',
          'false'
        );
      });
    });
  });

  describe('cancel button', () => {
    it('should not contain cancel button', () => {
      expect(element.querySelector<HTMLElement>('[aria-label="Cancel"]')).not.toBeInTheDocument();
    });

    it('should contain cancel button', async () => {
      hostComponent.hasCancel.set(true);
      await fixture.whenStable();
      expect(element.querySelector<HTMLElement>('[aria-label="Cancel"]')).toBeInTheDocument();
    });
  });

  it('should calculate visible items', async () => {
    hostComponent.generateSteps(10);
    await fixture.whenStable();
    expect(element.querySelectorAll('.container-steps .step').length).toBe(7);
    element.querySelector<HTMLElement>('.next')!.click();
  });

  describe('without navigation button', () => {
    beforeEach(async () => {
      hostComponent.hideNavigation.set(true);
      await fixture.whenStable();
    });

    it('should not show navigation buttons', () => {
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .back')
      ).not.toBeInTheDocument();
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .next')
      ).not.toBeInTheDocument();
    });

    it('should go to next step without navigation buttons', async () => {
      component.next();
      expect(component.index).toBe(1);
      await fixture.whenStable();
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .back')
      ).not.toBeInTheDocument();
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .next')
      ).not.toBeInTheDocument();
    });

    it('should go to previous step without navigation buttons', async () => {
      // Move step 2
      component.next();
      expect(component.index).toBe(1);
      await fixture.whenStable();

      // Move back
      component.back();
      expect(component.index).toBe(0);
      await fixture.whenStable();
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .back')
      ).not.toBeInTheDocument();
      expect(
        element.querySelector<HTMLElement>('.wizard-btn-container .next')
      ).not.toBeInTheDocument();
    });

    it('should align save button to end on last step when navigation is hidden', async () => {
      hostComponent.inlineNavigation.set(false);
      await fixture.whenStable();

      // Navigate to the last step
      component.next(hostComponent.steps().length - 1);
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.btn.save')).toBeInTheDocument();
      expect(element.querySelector<HTMLElement>('.btn.save')).toHaveClass('end');
    });
  });

  describe('navigation buttons in footer', () => {
    it('should not show navigation buttons inline if inlineNavigation is false', async () => {
      hostComponent.inlineNavigation.set(false);
      await fixture.whenStable();
      expect(
        element.querySelector<HTMLElement>('.container-wizard .wizard-btn-container .next')
      ).not.toBeInTheDocument();
    });

    it('should show navigation buttons inline if inlineNavigation is true', async () => {
      hostComponent.inlineNavigation.set(true);
      await fixture.whenStable();
      expect(
        element.querySelector<HTMLElement>('.container-wizard .wizard-btn-container .next')
      ).toBeInTheDocument();
    });
  });

  describe('steps with lazy loading', () => {
    it('should render steps if they are loaded lazily', async () => {
      hostComponent.steps.set([]);
      await fixture.whenStable();
      const steps = element.querySelectorAll('.step');
      expect(steps.length).toBe(0);
      vi.useFakeTimers();
      setTimeout(() => {
        hostComponent.generateSteps(3);
        fixture.detectChanges();
      }, 100);
      vi.advanceTimersByTime(100);

      await fixture.whenStable();
      const updatedSteps = element.querySelectorAll('.step');
      expect(updatedSteps.length).toBe(3);
      vi.useRealTimers();
    });
  });

  describe('use vertical layout', () => {
    beforeEach(() => {
      hostComponent.verticalLayout.set(true);
    });

    it('should use verticalMinSize for step container min-inline-size', async () => {
      hostComponent.verticalMinSize.set('100px');
      await fixture.whenStable();
      const container = fixture.debugElement.query(By.css('.container-steps.vertical'));
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.minInlineSize).toBe('100px');
    });

    it('should use verticalMaxSize for step container max-inline-size', async () => {
      hostComponent.verticalMaxSize.set('100px');
      await fixture.whenStable();
      const container = fixture.debugElement.query(By.css('.container-steps.vertical'));
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.maxInlineSize).toBe('100px');
    });

    it('should have divider to visually separate content and steps when showVerticalDivider is set to true', async () => {
      hostComponent.showVerticalDivider.set(true);
      await fixture.whenStable();
      const container = fixture.debugElement.query(By.css('.vertical-divider'));
      expect(container.nativeElement).toBeInTheDocument();
      const styles = getComputedStyle(container.nativeElement);
      expect(styles.borderRight).toBeTruthy();
    });

    it('should not have divider when showVerticalDivider is set to false', async () => {
      hostComponent.showVerticalDivider.set(false);
      await fixture.whenStable();
      expect(element.querySelector<HTMLElement>('.vertical-divider')).not.toBeInTheDocument();
    });
  });
});
