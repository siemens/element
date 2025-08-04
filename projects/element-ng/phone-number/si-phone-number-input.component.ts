/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
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
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { addIcons, elementDown2, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiSelectListHasFilterComponent } from '@siemens/element-ng/select';
import { injectSiTranslateService, SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { SiPhoneNumberInputSelectDirective } from './si-phone-number-input-select.directive';
import { CountryInfo, PhoneDetails } from './si-phone-number-input.models';

@Component({
  selector: 'si-phone-number-input',
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    NgClass,
    SiIconNextComponent,
    SiPhoneNumberInputSelectDirective,
    SiSelectListHasFilterComponent,
    SiTranslatePipe
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private changeDetectorRef = inject(ChangeDetectorRef);
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
   * $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_PLACEHOLDER:Search`
   * ```
   */
  readonly placeholderForSearch = input(
    $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_PLACEHOLDER:Search`
  );
  /**
   * @defaultValue
   * ```
   * $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_NO-RESULTS_FOUND:No results found`
   * ```
   */
  readonly searchNoResultsFoundLabel = input(
    $localize`:@@SI_PHONE_NUMBER_INPUT.SEARCH_NO-RESULTS_FOUND:No results found`
  );
  /**
   * Text for the country dropdown aria-label attribute.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHONE_NUMBER_INPUT.SELECT_COUNTRY:Select country`
   * ```
   */
  readonly selectCountryAriaLabel = input(
    $localize`:@@SI_PHONE_NUMBER_INPUT.SELECT_COUNTRY:Select country`
  );
  /**
   * Text for the phone number input aria-label attribute.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHONE_NUMBER_INPUT.PHONE_NUMBER_INPUT_LABEL:Enter phone number`
   * ```
   */
  readonly phoneNumberAriaLabel = input(
    $localize`:@@SI_PHONE_NUMBER_INPUT.PHONE_NUMBER_INPUT_LABEL:Enter phone number`
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

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  protected readonly phoneInput = viewChild.required<ElementRef<HTMLInputElement>>('phoneInput');
  protected selectedCountry?: CountryInfo;
  protected placeholder = '';
  protected readonly countryFocused = signal(false);
  protected open = false;
  protected overlayWidth = 0;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly countryList = computed(() => {
    const countries = this.allowedCountries() ?? this.phoneUtil.getSupportedRegions();
    return countries
      .map((country: string) => ({
        name: this.getCountryName(country),
        countryCode: this.phoneUtil.getCountryCodeForRegion(country),
        isoCode: country
      }))
      .sort((a: CountryInfo, b: CountryInfo) => a.name.localeCompare(b.name));
  });
  protected readonly icons = addIcons({ elementDown2 });
  private readonly allowedCountries = computed(
    () => this.supportedCountries() ?? this.phoneUtil.getSupportedRegions()
  );
  private readonly disabledNgControl = signal(false);
  private isValidNumber = true;
  private phoneNumber?: PhoneNumber;
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.country) {
      this.writeCountry();
    }
  }

  /** @internal */
  writeValue(value: string | undefined): void {
    this.phoneNumber = this.parseNumber(value);
    if (this.phoneNumber) {
      this.writeValueToInput();
      this.country.set(this.getRegionCode());
    } else {
      // Number could not be parsed, write raw value instead to handle cases like undefined
      this.writeTextToInput(value);
      this.country.set(this.defaultCountry() ?? this.country());
    }
    this.writeCountry();
    this.changeDetectorRef.markForCheck();
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
    if (!this.phoneInput().nativeElement.value) {
      return null;
    }

    this.isValidNumber = false;
    if (!this.phoneNumber || !this.phoneUtil.isValidNumber(this.phoneNumber)) {
      return {
        invalidPhoneNumberFormat: true
      };
    }

    if (!this.countryList().some(c => c.isoCode === this.selectedCountry!.isoCode)) {
      return {
        notSupportedPhoneNumberCountry: true
      };
    }

    this.isValidNumber = true;
    return null;
  }

  protected input(): void {
    const rawNumber = this.phoneInput().nativeElement.value;
    this.phoneNumber = this.parseNumber(rawNumber);

    if (this.phoneNumber) {
      const regionCode = this.getRegionCode();
      let countryInfo = this.countryList().find(country => regionCode === country.isoCode);
      if (!countryInfo && regionCode) {
        countryInfo = {
          name: this.getCountryName(regionCode),
          countryCode: this.phoneNumber.getCountryCode()!,
          isoCode: regionCode
        };
      }
      if (countryInfo && this.selectedCountry?.isoCode !== countryInfo.isoCode) {
        this.selectedCountry = countryInfo;
      }
    } else if (rawNumber.trim().startsWith('+')) {
      this.selectedCountry = undefined;
    }

    this.handleChange();
  }

  protected blur(): void {
    this.countryFocused.set(false);
    this.onTouched();
    this.writeValueToInput();
    this.valueChange.emit({
      country: this.selectedCountry,
      phoneNumber: this.formatPhoneNumber(PhoneNumberFormat.INTERNATIONAL),
      isValid: this.isValidNumber
    });
  }

  protected countryInput(num: CountryInfo): void {
    this.selectedCountry = num;
    this.updatePlaceholder();
    this.refreshValueAfterCountryChange();
    this.handleChange();
  }

  protected openOverlay(): void {
    if (!this.readonly()) {
      this.open = true;
      this.overlayWidth = this.elementRef.nativeElement.getBoundingClientRect().width + 2; // 2px border
    }
  }

  protected overlayDetach(): void {
    this.open = false;
    this.phoneInput().nativeElement.focus();
  }

  protected valueProvider(country: CountryInfo): string {
    return `${country.name} +${country.countryCode}`;
  }

  private writeCountry(): void {
    const currentCountry = this.country()!;
    this.selectedCountry = this.countryList().find(country => country.isoCode === currentCountry);
    if (!this.selectedCountry) {
      const countryCode = this.phoneUtil.getCountryCodeForRegion(
        currentCountry ?? this.defaultCountry() ?? 'XX'
      );
      if (countryCode) {
        this.selectedCountry = {
          isoCode: currentCountry,
          countryCode,
          name: this.getCountryName(currentCountry)
        };
      }
    }
    this.updatePlaceholder();
    this.refreshValueAfterCountryChange();
  }

  private getCountryName(countryCode: string): string {
    // This auto translates the given country name to the selected locale language
    return (
      new Intl.DisplayNames([this.translate.currentLanguage], { type: 'region' }).of(
        countryCode.toUpperCase()
      ) ?? ''
    );
  }

  private updatePlaceholder(): void {
    if (this.selectedCountry) {
      this.placeholder = this.phoneUtil
        .format(
          this.phoneUtil.getExampleNumber(this.selectedCountry.isoCode),
          PhoneNumberFormat.NATIONAL
        )
        .replace(/^0/, '');
    }
  }

  private parseNumber(rawNumber: string | undefined): PhoneNumber | undefined {
    try {
      let regionCodeForParsing: string | undefined;
      if (!rawNumber?.trim().startsWith('+')) {
        regionCodeForParsing = this.selectedCountry?.isoCode;
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
  private getRegionCode(): string | undefined {
    if (this.phoneNumber) {
      const regionCode = this.phoneUtil.getRegionCodeForNumber(this.phoneNumber);
      if (regionCode) {
        return regionCode;
      }

      const nationalNumber = this.phoneNumber.getNationalNumber() + '';
      if (
        // USA, CANADA, ...
        (this.phoneNumber.getCountryCode() === 1 && nationalNumber.length >= 3) ||
        // UK, ...
        (this.phoneNumber.getCountryCode() === 44 && nationalNumber.length >= 4)
      ) {
        return this.phoneUtil.getRegionCodeForNumber(
          this.phoneUtil.parse(
            '+' +
              this.phoneNumber.getCountryCode() +
              nationalNumber +
              new Array(10 - nationalNumber.length).fill(5).join('')
          )
        );
      }

      return this.phoneUtil.getRegionCodeForCountryCode(this.phoneNumber.getCountryCode()!);
    }

    return undefined;
  }

  private formatPhoneNumber(format: PhoneNumberFormat): string | undefined {
    if (this.phoneNumber) {
      return this.phoneUtil.format(this.phoneNumber, format);
    }

    return undefined;
  }

  private handleChange(): void {
    if (this.selectedCountry && this.country() !== this.selectedCountry?.isoCode) {
      this.country.set(this.selectedCountry?.isoCode);
    }

    if (this.phoneNumber) {
      this.onChange(this.formatPhoneNumber(PhoneNumberFormat.INTERNATIONAL)!);
    } else {
      this.onChange('');
    }
  }

  private writeTextToInput(value?: string): void {
    this.phoneInput().nativeElement.value = value ?? '';
  }
  /**
   * Format and update input text or clear input text if the input value is undefined.
   */
  private writeValueToInput(): void {
    if (this.phoneNumber) {
      this.writeTextToInput(this.formatPhoneNumber(PhoneNumberFormat.NATIONAL)!.replace(/^0/, ''));
    }
  }

  private refreshValueAfterCountryChange(): void {
    if (this.selectedCountry) {
      this.phoneNumber?.setCountryCode(this.selectedCountry?.countryCode);
      this.writeValueToInput();
    }
  }
}
