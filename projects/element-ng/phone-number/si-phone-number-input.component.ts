/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { LowerCasePipe } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { elementDown2 } from '@siemens/element-icons';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SelectOption, SiSelectListHasFilterComponent } from '@siemens/element-ng/select';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { SiPhoneNumberInputSelectDirective } from './si-phone-number-input-select.directive';
import { CountryInfo, PhoneDetails } from './si-phone-number-input.models';

@Component({
  selector: 'si-phone-number-input',
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    SiIconComponent,
    SiPhoneNumberInputSelectDirective,
    SiSelectListHasFilterComponent,
    SiTranslatePipe,
    LowerCasePipe
  ],
  templateUrl: './si-phone-number-input.component.html',
  styleUrl: './si-phone-number-input.component.scss',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: SiPhoneNumberInputComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiPhoneNumberInputComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiPhoneNumberInputComponent
    }
  ],
  host: {
    'role': 'group',
    '[attr.aria-labelledby]': 'labelledby()',
    '[attr.id]': 'id()',
    '[class.disabled]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[class.country-focus]': 'countryFocused()'
  }
})
export class SiPhoneNumberInputComponent
  implements ControlValueAccessor, Validator, OnChanges, SiFormItemControl
{
  private static idCounter = 0;

  private phoneUtil = PhoneNumberUtil.getInstance();
  private translate = injectSiTranslateService();
  private locale = inject(LOCALE_ID).toString();
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Unique identifier.
   *
   * @defaultValue
   * ```
   * `__si-phone-number-input-${SiPhoneNumberInputComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-phone-number-input-${SiPhoneNumberInputComponent.idCounter++}`);

  /**
   * ISO_3166-2 Code of the selected country.
   */
  readonly country = model<string>();

  /**
   * ISO_3166-2 Code of the country which shall be used on form-control reset.
   */
  readonly defaultCountry = input<string>();

  /**
   * Placeholder text for country search input.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_PLACEHOLDER:Search`)
   * ```
   */
  readonly placeholderForSearch = input(
    t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_PLACEHOLDER:Search`)
  );
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_NO-RESULTS_FOUND:No results found`)
   * ```
   */
  readonly searchNoResultsFoundLabel = input(
    t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_NO-RESULTS_FOUND:No results found`)
  );
  /**
   * Text for the country dropdown aria-label attribute.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SELECT_COUNTRY:Select country`)
   * ```
   */
  readonly selectCountryAriaLabel = input(
    t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.SELECT_COUNTRY:Select country`)
  );
  /**
   * Text for the phone number input aria-label attribute.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.PHONE_NUMBER_INPUT_LABEL:Enter phone number`)
   * ```
   */
  readonly phoneNumberAriaLabel = input(
    t(() => $localize`:@@SI_PHONE_NUMBER_INPUT.PHONE_NUMBER_INPUT_LABEL:Enter phone number`)
  );
  /**
   * List of countries in ISO2 format, from which the user is allowed to select one.
   * If no values are provided, the dropdown will show all known countries.
   */
  readonly supportedCountries = input<readonly string[] | null>();

  /**
   * @defaultValue
   * ```
   * `${this.id()}-label`
   * ```
   */
  readonly labelledby = input(`${this.id()}-label`);

  /** @defaultValue false */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  readonly valueChange = output<PhoneDetails>();

  /**
   * This ID will be bound to the `aria-describedby` attribute of the phone-number-input.
   * Use this to reference the element containing the error message(s) for the phone-number-input.
   * It will be picked by the {@link SiFormItemComponent} if the phone-number-input is used inside a form item.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  protected readonly phoneInput = viewChild.required<ElementRef<HTMLInputElement>>('phoneInput');
  protected readonly countryFocused = signal(false);
  protected readonly open = signal(false);
  protected overlayWidth = 0;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly phoneInputValue = signal('');
  protected readonly countryList = computed(() => {
    const countries = this.allowedCountries() ?? this.phoneUtil.getSupportedRegions();
    return countries
      .map((country: string) => {
        const countryInfo: CountryInfo = {
          name: this.getCountryName(country),
          countryCode: this.phoneUtil.getCountryCodeForRegion(country),
          isoCode: country
        };
        return {
          type: 'option',
          value: countryInfo,
          label: `${countryInfo.name} +${countryInfo.countryCode}`,
          typeaheadLabel: `${countryInfo.name} +${countryInfo.countryCode}`
        } as SelectOption<CountryInfo>;
      })
      .sort((a, b) => a.value.name.localeCompare(b.value.name));
  });
  protected readonly selectedCountry = computed(() => {
    const currentCountry = this.country();
    if (!currentCountry) {
      return undefined;
    }

    const selectedCountry = this.countryList().find(
      country => country.value.isoCode === currentCountry
    )?.value;
    if (selectedCountry) {
      return selectedCountry;
    }

    const countryCode = this.phoneUtil.getCountryCodeForRegion(currentCountry);
    if (!countryCode) {
      return undefined;
    }

    return {
      isoCode: currentCountry,
      countryCode,
      name: this.getCountryName(currentCountry)
    };
  });
  protected readonly placeholder = computed(() => {
    const selectedCountry = this.selectedCountry();
    if (!selectedCountry) {
      return '';
    }

    return this.phoneUtil
      .format(this.phoneUtil.getExampleNumber(selectedCountry.isoCode), PhoneNumberFormat.NATIONAL)
      .replace(/^0/, '');
  });
  protected readonly icons = addIcons({ elementDown2 });
  private readonly allowedCountries = computed(
    () => this.supportedCountries() ?? this.phoneUtil.getSupportedRegions()
  );
  private readonly disabledNgControl = signal(false);
  private isValidNumber = true;
  private readonly phoneNumber = computed(() => this.parseNumber(this.phoneInputValue()));
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.country) {
      this.refreshValueAfterCountryChange();
    }
  }

  /** @internal */
  writeValue(value: string | undefined): void {
    const phoneNumber = this.parseNumber(value);
    if (phoneNumber) {
      this.country.set(this.getRegionCode(phoneNumber));
      this.phoneInputValue.set(
        this.phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL).replace(/^0/, '')
      );
    } else {
      // Number could not be parsed, write raw value instead to handle cases like undefined
      this.phoneInputValue.set(value ?? '');
      this.country.set(this.defaultCountry() ?? this.country());
    }
  }

  /** @internal */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  /** @internal */
  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.phoneInputValue()) {
      return null;
    }

    this.isValidNumber = false;
    const phoneNumber = this.phoneNumber();
    if (!phoneNumber || !this.phoneUtil.isValidNumber(phoneNumber)) {
      return {
        invalidPhoneNumberFormat: true
      };
    }

    if (!this.countryList().some(c => c.value.isoCode === this.selectedCountry()!.isoCode)) {
      return {
        notSupportedPhoneNumberCountry: true
      };
    }

    this.isValidNumber = true;
    return null;
  }

  protected input(event: Event): void {
    const rawNumber = (event.target as HTMLInputElement).value;
    this.phoneInputValue.set(rawNumber);
    const phoneNumber = this.phoneNumber();

    if (phoneNumber) {
      const regionCode = this.getRegionCode(phoneNumber);
      if (regionCode && this.country() !== regionCode) {
        this.country.set(regionCode);
      }
    } else if (rawNumber.trim().startsWith('+')) {
      this.country.set(undefined);
    }

    this.handleChange();
  }

  protected blur(): void {
    this.countryFocused.set(false);
    this.onTouched();
    this.writeValueToInput();
  }

  protected countryInput(num: CountryInfo | undefined): void {
    this.country.set(num?.isoCode);
    this.refreshValueAfterCountryChange();
    this.handleChange();
  }

  protected openOverlay(): void {
    if (!this.readonly()) {
      this.open.set(true);
      this.overlayWidth = this.elementRef.nativeElement.getBoundingClientRect().width + 2; // 2px border
    }
  }

  protected overlayDetach(): void {
    this.open.set(false);
    this.phoneInput().nativeElement.focus();
  }

  private getCountryName(countryCode: string): string {
    // This auto translates the given country name to the selected locale language
    return (
      new Intl.DisplayNames([this.translate.currentLanguage ?? this.locale], {
        type: 'region'
      }).of(countryCode.toUpperCase()) ?? ''
    );
  }

  private parseNumber(rawNumber: string | undefined): PhoneNumber | undefined {
    try {
      let regionCodeForParsing: string | undefined;
      if (!rawNumber?.trim().startsWith('+')) {
        regionCodeForParsing = this.selectedCountry()?.isoCode;
      }
      return this.phoneUtil.parse(rawNumber, regionCodeForParsing);
    } catch (e) {
      // The Number is too short, we cannot parse it yet. Error can be ignored. Hopefully, the user enters more digits.
      return;
    }
  }

  /**
   * PhoneUtil does not resolve country code early enough when the national prefix is shared among other countries (+1 and +44).
   * This Method fakes a complete number to force PhoneUtil returning a proper region code.
   */
  private getRegionCode(phoneNumber: PhoneNumber): string | undefined {
    const regionCode = this.phoneUtil.getRegionCodeForNumber(phoneNumber);
    if (regionCode) {
      return regionCode;
    }

    const nationalNumber = phoneNumber.getNationalNumber() + '';
    if (
      // USA, CANADA, ...
      (phoneNumber.getCountryCode() === 1 && nationalNumber.length >= 3) ||
      // UK, ...
      (phoneNumber.getCountryCode() === 44 && nationalNumber.length >= 4)
    ) {
      return this.phoneUtil.getRegionCodeForNumber(
        this.phoneUtil.parse(
          '+' +
            phoneNumber.getCountryCode() +
            nationalNumber +
            new Array(10 - nationalNumber.length).fill(5).join('')
        )
      );
    }

    return this.phoneUtil.getRegionCodeForCountryCode(phoneNumber.getCountryCode()!);
  }

  private formatPhoneNumber(format: PhoneNumberFormat): string | undefined {
    const phoneNumber = this.phoneNumber();
    if (phoneNumber) {
      return this.phoneUtil.format(phoneNumber, format);
    }

    return undefined;
  }

  private handleChange(): void {
    const phoneNumber = this.formatPhoneNumber(PhoneNumberFormat.INTERNATIONAL);
    this.onChange(phoneNumber ?? '');

    this.valueChange.emit({
      country: this.selectedCountry(),
      phoneNumber,
      isValid: this.isValidNumber
    });
  }

  /**
   * Format and update input text or clear input text if the input value is undefined.
   */
  private writeValueToInput(): void {
    if (this.phoneNumber()) {
      this.phoneInputValue.set(
        this.formatPhoneNumber(PhoneNumberFormat.NATIONAL)!.replace(/^0/, '')
      );
    }
  }

  private refreshValueAfterCountryChange(): void {
    const selectedCountry = this.selectedCountry();
    if (selectedCountry) {
      this.writeValueToInput();
    }
  }
}
