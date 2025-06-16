/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { PhoneDetails, SiPhoneNumberInputComponent } from '.';
import { SiSelectFilterListHarness } from '../select/testing/si-select-filter-list.harness';

@Component({
  template: `
    <form [formGroup]="form">
      <si-phone-number-input
        id="test-phone"
        formControlName="workPhone"
        placeholderForSearch="Search"
        [selectCountryAriaLabel]="selectCountryAriaLabel"
        [supportedCountries]="supportedCountries"
        [readonly]="readonly"
        [defaultCountry]="defaultCountry"
        [(country)]="country"
        (valueChange)="valueChange($event)"
      />
    </form>
  `,
  imports: [SiPhoneNumberInputComponent, CommonModule, ReactiveFormsModule]
})
class WrapperComponent {
  country = 'DE';
  defaultCountry?: string;
  supportedCountries: string[] | null = ['IN', 'US', 'AE', 'CH', 'DE'];
  validationErrorMsg = '';
  readonly: boolean | '' = false;
  selectCountryAriaLabel = 'Select';
  form = new FormGroup({
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

  const typePhoneNumber = (phoneNumber: string): void => {
    inputElement.value = phoneNumber;
    inputElement.dispatchEvent(new Event('input'));
  };

  const blurPhoneNumber = (): void => {
    inputElement.dispatchEvent(new Event('blur'));
  };

  const getFilterListHarness = async (): Promise<SiSelectFilterListHarness> => {
    return TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
      SiSelectFilterListHarness.with('test-phone-listbox')
    );
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiPhoneNumberInputComponent, CommonModule, ReactiveFormsModule, WrapperComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    inputElement = fixture.debugElement.query(By.css('input.phone-number')).nativeElement;
  });

  it('should create phone number component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the correct country code on selecting a country from dropdown', () => {
    const selectCountry = element.querySelector('span.fi.fi-de') as HTMLElement;
    selectCountry.click();
    fixture.detectChanges();
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body-2'
    ) as HTMLElement;
    expect(displaySelectedCountry.textContent).toContain('+49');
  });

  it('should show sorted country list in dropdown, irrespective of order passed in supportedCountryList', async () => {
    // We have passed ['IN','US','AE','CH','DE'] as input to supportedCountryList from WrapperComponent
    const openDropdown = element.querySelector('.dropdown-toggle') as HTMLElement;
    openDropdown.click();
    fixture.detectChanges();
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
    const openDropdown = element.querySelector('.dropdown-toggle') as HTMLElement;
    openDropdown.click();
    const list = await getFilterListHarness();
    // Querying for "Switz" will display only "Switzerland +41" in the list
    await list.sendKeys('Switz');
    expect(await list.getAllItemTexts()).toEqual(['Switzerland +41']);

    // Selecting this option should update the selected value to +41
    await list.getItem(0).then(item => item.click());
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body-2'
    ) as HTMLElement;
    expect(displaySelectedCountry.textContent).toContain('+41');
  });

  it('should display all the countries  when user clears the search countries input', async () => {
    const openDropdown = element.querySelector('.dropdown-toggle') as HTMLElement;
    openDropdown.click();
    const list = await getFilterListHarness();
    await list.sendKeys('S');
    await list.clear();
    // All the five countries should be listed
    expect((await list.getAllItems()).length).toEqual(5);
  });

  it('should show invalid status on invalid phone entry', () => {
    typePhoneNumber('123');
    blurPhoneNumber();
    fixture.detectChanges();
    // Validate both the form control validity and also the final control value
    expect(component.form.controls.workPhone.errors?.invalidPhoneNumberFormat).toBeDefined();
    expect(component.form.controls.workPhone.value).toEqual('+49 123');
  });

  it('should show valid status on valid phone entry', () => {
    typePhoneNumber('30123456');
    fixture.detectChanges();
    blurPhoneNumber();
    fixture.detectChanges();
    // Validate both the form control validity and also the final control value
    expect(component.form.valid).toBeTrue();
    expect(component.form.controls.workPhone.value).toEqual('+49 30 123456');
  });

  it('should update the country code and phone number on setting it from the form control', fakeAsync(() => {
    fixture.componentInstance.form.controls.workPhone.setValue('+911234567890');
    fixture.detectChanges();
    const displaySelectedCountry = element.querySelector(
      '.dropdown-toggle .si-body-2'
    ) as HTMLElement;
    expect(displaySelectedCountry.textContent).toContain('+91');
    expect(inputElement.value).toEqual('1234 567 890');
  }));

  it('should remove input value on form-control reset', fakeAsync(() => {
    component.form.controls.workPhone.setValue('+911234567890');
    fixture.detectChanges();

    expect(inputElement.value).toEqual('1234 567 890');
    component.form.reset();
    fixture.detectChanges();
    expect(inputElement.value).toEqual('');
  }));

  it('should set selected country to defaultCountry on form-control reset', fakeAsync(() => {
    component.defaultCountry = 'CH';
    component.form.controls.workPhone.setValue('+911234567890');
    fixture.detectChanges();

    const countryButton = fixture.debugElement.query(
      By.css('button[role="combobox"]')
    ).nativeElement;
    expect(countryButton.textContent).toContain('+91');
    component.form.reset();
    fixture.detectChanges();
    expect(countryButton.textContent).toContain('+41');
  }));

  it('should update both the country code and phone number when manually entering a valid country code and phone number in the input', () => {
    typePhoneNumber('+911234567890');
    fixture.detectChanges();
    blurPhoneNumber();
    fixture.detectChanges();
    // Validate both the form control validity and also the final control value
    expect(component.form.valid).toBeTrue();
    expect(component.form.controls.workPhone.value).toEqual('+91 1234 567 890');
  });

  it('should show invalid state when when manually entering a valid country code and invalid phone number in the input', () => {
    typePhoneNumber('+9101');
    fixture.detectChanges();
    blurPhoneNumber();
    fixture.detectChanges();
    // Validate both the form control validity and also the final control value
    expect(component.form.invalid).toBeTrue();
    expect(component.form.controls.workPhone.value).toEqual('+91 01');
  });

  it('should update country dropdown list on changing supportedCountryList', async () => {
    const openDropdown = element.querySelector('.dropdown-toggle') as HTMLElement;
    component.supportedCountries = ['CA', 'NZ'];
    openDropdown.click();
    fixture.detectChanges();
    const list = await getFilterListHarness();
    expect(await list.getAllItemTexts()).toEqual(['Canada +1', 'New Zealand +64']);
  });

  it('should reflect initialCountry changes after view init', () => {
    component.country = 'US';
    fixture.detectChanges();

    const countryCode = element.querySelector<HTMLElement>('span.si-body-2');
    expect(countryCode?.innerText.trim()).toContain('+1');
  });

  it('should reflect country when not part of supportedCountries', () => {
    component.country = 'AU';
    fixture.detectChanges();

    const countryCode = element.querySelector<HTMLElement>('span.si-body-2');
    expect(countryCode?.innerText.trim()).toContain('+61');
  });

  it('should be invalid if the country code is allowed but not the actual region (+1 but not CA)', () => {
    typePhoneNumber('+1 403 234 5678');
    fixture.detectChanges();
    expect(component.country).toBe('CA');
    expect(component.form.controls.workPhone.errors!).toEqual({
      notSupportedPhoneNumberCountry: true
    });
  });

  it('should detect country early if country code is shared', () => {
    typePhoneNumber('+441534');
    fixture.detectChanges();
    expect(component.country).toBe('JE');
  });

  it('should not show error when the supportedCountries list change after country selection', () => {
    // The country is pre initialized and we are changing the supported country list
    component.supportedCountries = null;
    fixture.detectChanges();

    typePhoneNumber('211111111');
    fixture.detectChanges();
    blurPhoneNumber();

    // Validate both the form control validity and also the final control value
    expect(component.form.controls.workPhone.errors).toBeFalsy();
  });

  describe('with control disabled', () => {
    let phoneInput: HTMLElement;

    beforeEach(async () => {
      component.form.disable();
      fixture.detectChanges();
      await fixture.whenStable();
      phoneInput = element.querySelector<HTMLElement>('si-phone-number-input')!;
    });

    it('should have class disabled', async () => {
      expect(phoneInput.classList).toContain('disabled');
    });

    it('should have attribute disabled on input', () => {
      const input = phoneInput.querySelector<HTMLInputElement>('input[type="tel"]');
      expect(input).toBeTruthy();
      expect(input!.getAttribute('disabled')).toBeDefined();
    });

    it('should not have tabindex 0', async () => {
      expect(phoneInput.classList).toContain('disabled');
      element = phoneInput.querySelector<HTMLElement>('button')!;
      expect(element?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('with control readonly', () => {
    let phoneInput: HTMLElement;

    beforeEach(async () => {
      component.readonly = '';
      fixture.detectChanges();
      await fixture.whenStable();
      phoneInput = element.querySelector<HTMLElement>('si-phone-number-input')!;
    });

    it('should have class readonly', async () => {
      expect(phoneInput.classList).toContain('readonly');
    });

    it('should not open country select', () => {
      const selectCountry = element.querySelector('span.fi.fi-de') as HTMLElement;
      selectCountry.click();
      fixture.detectChanges();
      const displaySelectedCountry = document.querySelector('.dropdown-menu') as HTMLElement;
      expect(displaySelectedCountry).toBeNull();
    });
  });
});
