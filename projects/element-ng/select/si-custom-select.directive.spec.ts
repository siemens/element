/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  inputBinding,
  signal,
  twoWayBinding
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL } from '@siemens/element-ng/form';

import { SiCustomSelectDirective } from './si-custom-select.directive';
import { SiSelectComboboxComponent } from './si-select-combobox.component';
import { SiSelectDropdownDirective } from './si-select-dropdown.directive';

@Component({
  selector: 'si-test-select',
  imports: [SiSelectComboboxComponent, SiSelectDropdownDirective],
  template: `
    <si-select-combobox>
      {{ select.value() ?? 'Pick...' }}
    </si-select-combobox>

    <ng-template si-select-dropdown>
      @for (opt of options(); track opt) {
        <button type="button" class="dropdown-item" (click)="pick(opt)">{{ opt }}</button>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: SiCustomSelectDirective,
      inputs: ['disabled', 'readonly', 'value'],
      outputs: ['valueChange']
    }
  ]
})
class SiTestSelectComponent {
  readonly select = inject(SiCustomSelectDirective<string>);
  readonly options = signal<string[]>(['Alpha', 'Beta', 'Gamma']);

  pick(opt: string): void {
    this.select.updateValue(opt);
    this.select.close();
  }
}

@Component({
  imports: [SiTestSelectComponent, ReactiveFormsModule],
  template: `<si-test-select [formControl]="control" />`
})
class FormHostComponent {
  readonly control = new FormControl<string | undefined>(undefined);
}

describe('SiCustomSelectDirective', () => {
  let fixture: ComponentFixture<SiTestSelectComponent>;
  let overlayContainerElement: HTMLElement;

  const getHost = (): HTMLElement => fixture.nativeElement;

  const getOverlayDropdown = (): HTMLElement | null =>
    overlayContainerElement.querySelector('.dropdown-menu');

  const getDropdownItems = (): HTMLElement[] =>
    Array.from(overlayContainerElement.querySelectorAll('.dropdown-item'));

  describe('direct usage', () => {
    let value: ReturnType<typeof signal<string | undefined>>;
    let disabled: ReturnType<typeof signal<boolean>>;
    let readonly: ReturnType<typeof signal<boolean>>;

    beforeEach(async () => {
      value = signal<string | undefined>(undefined);
      disabled = signal(false);
      readonly = signal(false);

      fixture = TestBed.createComponent(SiTestSelectComponent, {
        bindings: [
          twoWayBinding('value', value),
          inputBinding('disabled', disabled),
          inputBinding('readonly', readonly)
        ]
      });
      overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
      await fixture.whenStable();
    });

    it('should render combobox role on host', () => {
      expect(getHost()).toHaveAttribute('role', 'combobox');
      expect(getHost()).toHaveAttribute('aria-expanded', 'false');
    });

    it('should display placeholder text when no value is set', () => {
      expect(getHost()).toHaveTextContent('Pick...');
    });

    it('should open dropdown on click', async () => {
      getHost().click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).toBeInTheDocument();
      expect(getHost()).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render options in the dropdown', async () => {
      getHost().click();
      await fixture.whenStable();

      const items = getDropdownItems();
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Alpha');
      expect(items[1]).toHaveTextContent('Beta');
      expect(items[2]).toHaveTextContent('Gamma');
    });

    it('should select a value and close dropdown', async () => {
      getHost().click();
      await fixture.whenStable();

      getDropdownItems()[1].click();
      await fixture.whenStable();

      expect(value()).toBe('Beta');
      expect(getOverlayDropdown()).not.toBeInTheDocument();
      expect(getHost()).toHaveAttribute('aria-expanded', 'false');
    });

    it('should display selected value text', async () => {
      value.set('Gamma');
      await fixture.whenStable();

      expect(getHost()).toHaveTextContent('Gamma');
    });

    it('should close dropdown on backdrop click', async () => {
      getHost().click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).toBeInTheDocument();

      const backdrop = overlayContainerElement
        .closest('body')!
        .querySelector<HTMLElement>('.cdk-overlay-backdrop');
      backdrop!.click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).not.toBeInTheDocument();
    });

    it('should close dropdown on Escape key', async () => {
      getHost().click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).toBeInTheDocument();

      const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      overlayPane.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(getOverlayDropdown()).not.toBeInTheDocument();
    });

    it('should not open when disabled', async () => {
      disabled.set(true);
      await fixture.whenStable();

      getHost().click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).not.toBeInTheDocument();
    });

    it('should not open when readonly', async () => {
      readonly.set(true);
      await fixture.whenStable();

      getHost().click();
      await fixture.whenStable();

      expect(getOverlayDropdown()).not.toBeInTheDocument();
    });

    it('should apply disabled host class', async () => {
      disabled.set(true);
      await fixture.whenStable();

      expect(getHost()).toHaveClass('disabled');
    });

    it('should apply readonly host class', async () => {
      readonly.set(true);
      await fixture.whenStable();

      expect(getHost()).toHaveClass('readonly');
    });

    it('should apply open host class when dropdown is open', async () => {
      getHost().click();
      await fixture.whenStable();

      expect(getHost()).toHaveClass('open');
    });

    it('should apply dropdown host class', () => {
      expect(getHost()).toHaveClass('dropdown');
    });
  });

  describe('as form control', () => {
    let formFixture: ComponentFixture<FormHostComponent>;
    let formHost: FormHostComponent;

    beforeEach(async () => {
      formFixture = TestBed.createComponent(FormHostComponent);
      fixture = undefined!;
      overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
      formHost = formFixture.componentInstance;
      await formFixture.whenStable();
    });

    it('should write value from form control', async () => {
      formHost.control.setValue('Alpha');
      await formFixture.whenStable();

      const host = formFixture.nativeElement.querySelector('si-test-select');
      expect(host).toHaveTextContent('Alpha');
    });

    it('should update form control when value is selected', async () => {
      const host: HTMLElement = formFixture.nativeElement.querySelector('si-test-select');
      host.click();
      await formFixture.whenStable();

      getDropdownItems()[2].click();
      await formFixture.whenStable();

      expect(formHost.control.value).toBe('Gamma');
    });

    it('should mark control as touched when dropdown is closed', async () => {
      const host: HTMLElement = formFixture.nativeElement.querySelector('si-test-select');
      expect(formHost.control.touched).toBe(false);

      host.click();
      await formFixture.whenStable();

      expect(formHost.control.touched).toBe(false);

      getDropdownItems()[0].click();
      await formFixture.whenStable();

      expect(formHost.control.touched).toBe(true);
    });

    it('should mark control as touched when closing via backdrop', async () => {
      const host: HTMLElement = formFixture.nativeElement.querySelector('si-test-select');
      host.click();
      await formFixture.whenStable();

      const backdrop = overlayContainerElement
        .closest('body')!
        .querySelector<HTMLElement>('.cdk-overlay-backdrop');
      backdrop!.click();
      await formFixture.whenStable();

      expect(formHost.control.touched).toBe(true);
    });

    it('should disable via form control', async () => {
      formHost.control.disable();
      await formFixture.whenStable();

      const host: HTMLElement = formFixture.nativeElement.querySelector('si-test-select');
      expect(host).toHaveClass('disabled');

      host.click();
      await formFixture.whenStable();

      expect(getOverlayDropdown()).not.toBeInTheDocument();
    });
  });

  describe('SiFormItemControl integration', () => {
    it('should provide SI_FORM_ITEM_CONTROL token', async () => {
      fixture = TestBed.createComponent(SiTestSelectComponent);
      await fixture.whenStable();

      const formItemControl = fixture.debugElement.injector.get(SI_FORM_ITEM_CONTROL);
      expect(formItemControl).toBeTruthy();
      expect(formItemControl.errormessageId).toBeDefined();
    });
  });
});
