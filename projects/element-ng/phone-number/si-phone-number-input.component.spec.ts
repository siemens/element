/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { page, userEvent } from 'vitest/browser';

import { PhoneDetails, SiPhoneNumberInputComponent } from '.';
import { SiSelectFilterListHarness } from '../select/testing/si-select-filter-list.harness';

@Component({
  imports: [SiPhoneNumberInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <si-phone-number-input
        id="test-phone"
        class="form-control"
        formControlName="workPhone"
        placeholderForSearch="Search"
        selectCountryAriaLabel="Select"
        [supportedCountries]="supportedCountries()"
        [readonly]="readonly()"
        [defaultCountry]="defaultCountry()"
        [(country)]="country"
        (valueChange)="valueChange($event)"
      />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly country = signal('DE');
  readonly defaultCountry = signal<string | undefined>(undefined);
  readonly supportedCountries = signal<string[] | null>(['IN', 'US', 'AE', 'CH', 'DE']);
  readonly readonly = signal<boolean | ''>(false);
  readonly form = new FormGroup({
    workPhone: new FormControl()
  });
  currentValue!: PhoneDetails;

  valueChange(event: PhoneDetails): void {
    this.currentValue = event;
  }
}

describe('SiPhoneNumberInputComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let element: HTMLElement;
  let inputElement: HTMLInputElement;

  const getFilterListHarness = async (): Promise<SiSelectFilterListHarness> => {
    return TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
      SiSelectFilterListHarness.with('test-phone-listbox')
    );
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
    inputElement = fixture.debugElement.query(By.css('input.phone-number')).nativeElement;
  });

  it('should create phone number component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the correct country code on selecting a country from dropdown', async () => {
    await userEvent.click(page.getByRole('combobox', { name: 'Select' }));
    await fixture.whenStable();
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body'
    ) as HTMLElement;
    expect(displaySelectedCountry).toHaveTextContent('+49');
  });

  it('should show sorted country list in dropdown, irrespective of order passed in supportedCountryList', async () => {
    // We have passed ['IN','US','AE','CH','DE'] as input to supportedCountryList from WrapperComponent
    await userEvent.click(page.getByRole('combobox', { name: 'Select' }));
    await fixture.whenStable();
    const list = await getFilterListHarness();

    expect(await list.getAllItemTexts()).toEqual([
      'Germany +49',
      'India +91',
      'Switzerland +41',
      'United Arab Emirates +971',
      'United States +1'
    ]);
  });

  it('should filter the appropriate countries when user searches for one', async () => {
    await userEvent.click(page.getByRole('combobox', { name: 'Select' }));
    const list = await getFilterListHarness();
    // Querying for "Switz" will display only "Switzerland +41" in the list
    await list.sendKeys('Switz');
    expect(await list.getAllItemTexts()).toEqual(['Switzerland +41']);

    // Selecting this option should update the selected value to +41
    await list.getItem(0).then(item => item.click());
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body'
    ) as HTMLElement;
    expect(displaySelectedCountry).toHaveTextContent('+41');
  });

  it('should display all the countries  when user clears the search countries input', async () => {
    await userEvent.click(page.getByRole('combobox', { name: 'Select' }));
    const list = await getFilterListHarness();
    await list.sendKeys('S');
    await list.clear();
    // All the five countries should be listed
    expect(await list.getAllItems()).toHaveLength(5);
  });

  it('should show invalid status on invalid phone entry', async () => {
    await userEvent.type(inputElement, '123');
    await userEvent.tab();

    // Validate both the form control validity and also the final control value
    expect(component.form.controls.workPhone.errors?.invalidPhoneNumberFormat).toBeDefined();
    expect(component.form.controls.workPhone.value).toEqual('+49 123');
  });

  it('should show valid status on valid phone entry', async () => {
    await userEvent.type(inputElement, '30123456');
    await userEvent.tab();

    // Validate both the form control validity and also the final control value
    expect(component.form.valid).toBe(true);
    expect(component.form.controls.workPhone.value).toEqual('+49 30 123456');
  });

  it('should update the country code and phone number on setting it from the form control', async () => {
    fixture.componentInstance.form.controls.workPhone.setValue('+911234567890');
    await fixture.whenStable();
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body'
    ) as HTMLElement;
    expect(displaySelectedCountry).toHaveTextContent('+91');
    expect(inputElement.value).toEqual('1234 567 890');
  });

  it('should remove input value on form-control reset', async () => {
    component.form.controls.workPhone.setValue('+911234567890');
    await fixture.whenStable();

    expect(inputElement.value).toEqual('1234 567 890');
    component.form.reset();
    await fixture.whenStable();
    expect(inputElement.value).toEqual('');
  });

  it('should set selected country to defaultCountry on form-control reset', async () => {
    component.defaultCountry.set('CH');
    component.form.controls.workPhone.setValue('+911234567890');
    await fixture.whenStable();

    const countryButton = page.getByRole('combobox', { name: 'Select' });
    await expect.element(countryButton).toHaveTextContent('+91');
    component.form.reset();
    await fixture.whenStable();
    await expect.element(countryButton).toHaveTextContent('+41');
  });

  it('should update both the country code and phone number when manually entering a valid country code and phone number in the input', async () => {
    await userEvent.type(inputElement, '+911234567890');
    await userEvent.tab();

    // Validate both the form control validity and also the final control value
    expect(component.form.valid).toBe(true);
    expect(component.form.controls.workPhone.value).toEqual('+91 1234 567 890');
  });

  it('should show invalid state when when manually entering a valid country code and invalid phone number in the input', async () => {
    await userEvent.type(inputElement, '+9101');
    await userEvent.tab();

    // Validate both the form control validity and also the final control value
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.workPhone.value).toEqual('+91 01');
  });

  it('should update country dropdown list on changing supportedCountryList', async () => {
    component.supportedCountries.set(['CA', 'NZ']);
    await fixture.whenStable();
    await userEvent.click(page.getByRole('combobox', { name: 'Select' }));
    await fixture.whenStable();
    const list = await getFilterListHarness();
    expect(await list.getAllItemTexts()).toEqual(['Canada +1', 'New Zealand +64']);
  });

  it('should reflect initialCountry changes after view init', async () => {
    component.country.set('US');
    await fixture.whenStable();

    const countryCode = element.querySelector<HTMLElement>('span.si-body');
    expect(countryCode).toHaveTextContent('+1');
  });

  it('should reflect country when not part of supportedCountries', async () => {
    component.country.set('AU');
    await fixture.whenStable();

    const countryCode = element.querySelector<HTMLElement>('span.si-body');
    expect(countryCode).toHaveTextContent('+61');
  });

  it('should be invalid if the country code is allowed but not the actual region (+1 but not CA)', async () => {
    await userEvent.type(inputElement, '+1 403 234 5678');
    await fixture.whenStable();
    expect(component.country()).toBe('CA');
    expect(component.form.controls.workPhone.errors!).toEqual({
      notSupportedPhoneNumberCountry: true
    });
  });

  it('should detect country early if country code is shared', async () => {
    await userEvent.type(inputElement, '+441534');
    await fixture.whenStable();
    expect(component.country()).toBe('JE');
  });

  it('should not show error when the supportedCountries list change after country selection', async () => {
    // The country is pre initialized and we are changing the supported country list
    component.supportedCountries.set(null);
    await fixture.whenStable();

    await userEvent.type(inputElement, '211111111');
    await userEvent.tab();

    // Validate both the form control validity and also the final control value
    expect(component.form.controls.workPhone.errors).toBeFalsy();
  });

  describe('with control disabled', () => {
    let phoneInput: HTMLElement;

    beforeEach(async () => {
      component.form.disable();
      await fixture.whenStable();
      phoneInput = element.querySelector<HTMLElement>('si-phone-number-input')!;
    });

    it('should have class disabled', async () => {
      expect(phoneInput).toHaveClass('disabled');
    });

    it('should have attribute disabled on input', () => {
      const input = phoneInput.querySelector<HTMLInputElement>('input[type="tel"]');
      expect(input).toBeInTheDocument();
      expect(input!).toHaveAttribute('disabled');
    });

    it('should not have tabindex 0', async () => {
      expect(phoneInput).toHaveClass('disabled');
      element = phoneInput.querySelector<HTMLElement>('button')!;
      expect(element).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('with control readonly', () => {
    let phoneInput: HTMLElement;

    beforeEach(async () => {
      component.readonly.set('');
      await fixture.whenStable();
      phoneInput = element.querySelector<HTMLElement>('si-phone-number-input')!;
    });

    it('should have class readonly', async () => {
      expect(phoneInput).toHaveClass('readonly');
    });

    it('should not open country select', async () => {
      const selectCountry = element.querySelector('span.fi.fi-de') as HTMLElement;
      selectCountry.click();
      await fixture.whenStable();
      const displaySelectedCountry = document.querySelector('.dropdown-menu') as HTMLElement;
      expect(displaySelectedCountry).not.toBeInTheDocument();
    });
  });
});
