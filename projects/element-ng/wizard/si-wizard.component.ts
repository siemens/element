/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { WebComponentContentChildren } from '@siemens/element-ng/common';
import {
  addIcons,
  elementCancel,
  elementChecked,
  elementCheckedFilled,
  elementLeft4,
  elementNotChecked,
  elementRadioChecked,
  elementRight4,
  elementWarningFilled,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiWizardStepComponent } from './si-wizard-step.component';

interface StepItem {
  index: number;
  step: SiWizardStepComponent;
}

@Component({
  selector: 'si-wizard',
  imports: [
    NgClass,
    SiIconNextComponent,
    SiResizeObserverDirective,
    SiTranslatePipe,
    NgTemplateOutlet
  ],
  templateUrl: './si-wizard.component.html',
  styleUrl: './si-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'py-6 px-8 d-flex flex-column',
    '[class.vertical]': 'verticalLayout()',
    '[style.--wizard-vertical-min-size]': 'verticalMinSize()',
    '[style.--wizard-vertical-max-size]': 'verticalMaxSize()'
  }
})
export class SiWizardComponent {
  protected readonly containerSteps = viewChild<ElementRef<HTMLDivElement>>('containerSteps');

  /**
   * Description of back button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_WIZARD.BACK:Back`
   * ```
   */
  readonly backText = input($localize`:@@SI_WIZARD.BACK:Back`);
  /**
   * Description of next button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_WIZARD.NEXT:Next`
   * ```
   */
  readonly nextText = input($localize`:@@SI_WIZARD.NEXT:Next`);

  /**
   * Hide the navigation buttons previous/next.
   *
   * @defaultValue false
   */
  readonly hideNavigation = input(false, { transform: booleanAttribute });
  /**
   * Description of save button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_WIZARD.SAVE:Save`
   * ```
   */
  readonly saveText = input($localize`:@@SI_WIZARD.SAVE:Save`);
  /**
   * Hide the save button.
   *
   * @defaultValue false
   */
  readonly hideSave = input(false, { transform: booleanAttribute });
  /**
   * Text shown if you complete the wizard.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_WIZARD.COMPLETED:Wizard completed!`
   * ```
   */
  readonly completionText = input($localize`:@@SI_WIZARD.COMPLETED:Wizard completed!`);
  /**
   * Description of cancel button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_WIZARD.CANCEL:Cancel`
   * ```
   */
  readonly cancelText = input($localize`:@@SI_WIZARD.CANCEL:Cancel`);
  /**
   * Show the cancel button
   *
   * @defaultValue false
   */
  readonly hasCancel = input(false, { transform: booleanAttribute });
  /**
   * Display a predefined page by the end of the wizard.
   *
   * @defaultValue false
   */
  readonly enableCompletionPage = input(false, { transform: booleanAttribute });
  /**
   * Define how many milliseconds the completion page is visible.
   *
   * @defaultValue 3000
   */
  readonly completionPageVisibleTime = input(3000);
  /**
   * Class name of icon shown for current and upcoming steps.
   *
   * @defaultValue 'elementNotChecked'
   */
  readonly stepIcon = input('elementNotChecked');
  /**
   * Class name of icon shown for the active step.
   *
   * @defaultValue 'elementRadioChecked'
   */
  readonly stepActiveIcon = input('elementRadioChecked');
  /**
   * Class name of icon shown when a step was completed.
   *
   * @defaultValue 'elementCheckedFilled'
   */
  readonly stepCompletedIcon = input('elementCheckedFilled');
  /**
   * Class name of icon shown when a step had an error.
   *
   * @defaultValue 'elementWarningFilled'
   */
  readonly stepFailedIcon = input('elementWarningFilled');
  /**
   * Set the orientation of the wizard to vertical.
   *
   * @defaultValue false
   */
  readonly verticalLayout = input(false, { transform: booleanAttribute });
  /**
   * Set false to show navigation buttons in footer instead of inline.
   *
   * @defaultValue true
   */
  readonly inlineNavigation = input(true, { transform: booleanAttribute });
  /**
   * Use number representation for steps.
   *
   * @defaultValue false
   */
  readonly showStepNumbers = input(false, { transform: booleanAttribute });
  /**
   * Set to true to display a divider between the steps and the content in the vertical
   *
   * @defaultValue false
   */
  readonly showVerticalDivider = input(false, { transform: booleanAttribute });
  /** Set the wizard step container min size in vertical layout. */
  readonly verticalMinSize = input<string>();
  /** Set the wizard step container max size in vertical layout. */
  readonly verticalMaxSize = input<string>();

  /** Callback function triggered after the wizard has been completed. */
  readonly completionAction = output();

  /** Callback function triggered if the wizard has been canceled. */
  readonly wizardCancel = output();

  /** Get the current step wizard step index. */
  get index(): number {
    return this._index();
  }

  /** Get number of wizard steps. */
  get stepCount(): number {
    return this.steps().length;
  }

  /** Get current visible wizard step. */
  get currentStep(): SiWizardStepComponent | undefined {
    return this._currentStep();
  }

  @WebComponentContentChildren(SiWizardStepComponent)
  protected readonly steps = contentChildren(SiWizardStepComponent);
  protected readonly visibleSteps = linkedSignal(() => this.calculateVisibleStepCount());
  protected readonly showCompletionPage = signal(false);
  /** The list of visible steps. */
  protected readonly activeSteps = computed(() => this.computeVisibleSteps());

  private readonly _index = linkedSignal(() => {
    const currentStep = this._currentStep();
    const currentStepIndex = currentStep ? this.steps().indexOf(currentStep) : 0;
    return currentStepIndex < 0 ? 0 : currentStepIndex;
  });
  private readonly _currentStep = linkedSignal(() => {
    const steps = this.steps();
    const currentActive = steps.find(step => step.isActive());
    if (currentActive) {
      return currentActive;
    } else if (steps.length) {
      untracked(() => steps[0].isActive.set(true));
      return steps[0];
    } else {
      return undefined;
    }
  });
  protected readonly icons = addIcons({
    elementCancel,
    elementChecked,
    elementCheckedFilled,
    elementLeft4,
    elementNotChecked,
    elementRight4,
    elementRadioChecked,
    elementWarningFilled
  });

  protected canActivate(stepIndex: number): boolean {
    if (stepIndex < 0) {
      return false;
    }
    // Can always activate previous steps
    if (stepIndex < this.index) {
      return true;
    }
    // We are already in the step. Nothing to activate.
    if (stepIndex === this.index) {
      return false;
    }
    // Fast-forward: check all steps if they are valid
    for (let i = this.index; i < stepIndex; i++) {
      const theStep = this.steps()[i];
      if (!theStep.isValid()) {
        return false;
      }
    }
    return true;
  }

  protected activateStep(event: Event, stepIndex: number): void {
    event.preventDefault();
    if (this.canActivate(stepIndex)) {
      if (stepIndex > this.index) {
        this.next(stepIndex - this.index);
      }
      if (stepIndex < this.index) {
        this.back(this.index - stepIndex);
      }
    }
  }

  protected getStateClass(stepIndex: number): string {
    if (stepIndex === this.index) {
      return 'active';
    }
    if (!this.canActivate(stepIndex)) {
      return 'disabled';
    }
    if (stepIndex < this.index) {
      return 'completed';
    }
    return '';
  }

  protected getAriaDisabled(stepIndex: number): string {
    if (!this.canActivate(stepIndex)) {
      return 'true';
    }
    return 'false';
  }

  protected getAriaCurrent(stepIndex: number): string {
    if (stepIndex === this.index) {
      return 'step';
    }
    return 'false';
  }

  /**
   * Go to the next wizard step.
   * @param delta - optional number of steps to move forward.
   */
  next(delta: number = 1): void {
    const steps = this.steps();
    if (this.index === steps.length - 1) {
      return;
    }
    const stepIndex = this.index + delta;
    const nextStep = steps[stepIndex];
    if (this.canActivate(stepIndex)) {
      this.currentStep?.next.emit();
      if (this.currentStep?.isNextNavigable()) {
        this.activate(nextStep);
      }
    }
  }

  /**
   * Go to the previous wizard step.
   * @param delta - optional number of steps to move backwards.
   */
  back(delta: number = 1): void {
    if (this.index === 0) {
      return;
    }
    this.currentStep?.back.emit();
    this.activate(this.steps()[this.index - delta]);
  }

  /** Triggers the save action to complete the wizard. */
  save(): void {
    this.currentStep?.save.emit();

    if (this.enableCompletionPage() && this.completionPageVisibleTime() > 0) {
      this.showCompletionPage.set(true);
      setTimeout(() => {
        this.showCompletionPage.set(false);
        this.completionAction.emit();
      }, this.completionPageVisibleTime());
    } else {
      this.completionAction.emit();
    }
  }

  protected getState(step: SiWizardStepComponent, stepIndex: number): string {
    if (step.failed() === true) {
      return this.stepFailedIcon();
    }
    const txtStyle = step.isActive() ? this.stepActiveIcon() : this.stepIcon();
    return stepIndex >= this.index ? txtStyle : this.stepCompletedIcon();
  }

  private activate(step: SiWizardStepComponent): void {
    if (this.currentStep) {
      this.currentStep.isActive.set(false);
    }

    step.isActive.set(true);
    this._currentStep.set(step);
    this._index.set(this.steps().indexOf(step));
  }

  protected updateVisibleSteps(): void {
    const newVisibleSteps = this.calculateVisibleStepCount();
    if (newVisibleSteps !== this.visibleSteps()) {
      this.visibleSteps.set(newVisibleSteps);
    }
  }

  private calculateVisibleStepCount(): number {
    const containerSteps = this.containerSteps();
    if (!containerSteps) {
      return 0;
    }
    if (this.verticalLayout()) {
      const computedStyle = getComputedStyle(containerSteps.nativeElement);
      const clientHeight =
        containerSteps.nativeElement.clientHeight -
        parseInt(computedStyle.paddingBlockStart) -
        parseInt(computedStyle.paddingBlockEnd);
      return Math.max(Math.floor(clientHeight / 48), 1);
    } else {
      const clientWidth = containerSteps.nativeElement.clientWidth;
      return Math.max(Math.floor(clientWidth / 150), 1);
    }
  }

  private computeVisibleSteps(): StepItem[] {
    const create = (index: number): StepItem => ({ index, step: this.steps()[index] });
    if (this.steps().length === 0) {
      return [];
    } else if (this.visibleSteps() <= 1) {
      return [create(this.index)];
    } else if (this.stepCount <= this.visibleSteps()) {
      return this.steps().map((_, i) => create(i));
    } else {
      const steps = [this.index];
      for (
        let i = 1, left = this.index - 1, right = this.index + 1;
        i < this.visibleSteps();
        right++, left--
      ) {
        // Iterate in both directions to check current step is in visible range.
        if (right < this.stepCount) {
          steps.push(right);
          i++;
        }
        if (left >= 0 && i < this.visibleSteps()) {
          steps.push(left);
          i++;
        }
      }

      return steps.sort((l, r) => l - r).map(i => create(i));
    }
  }
}
