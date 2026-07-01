/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { LowerCasePipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  private locale = inject(LOCALE_ID).toString();
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
  protected readonly selectedCountry = signal<CountryInfo | undefined>(undefined);
  protected placeholder = '';
  /**
   * The national (trunk) prefix of the currently entered number, shown as a non-editable
   * `(0)` indicator. The phone number itself is displayed in international format without
   * the country code, so the leading trunk `0` is never part of the input and is instead
   * represented by this indicator.
   *
   * The indicator is number-aware: it is only shown when the droppable `0` trunk prefix
   * genuinely prepends the displayed number (i.e. the national format equals `0` + the
   * displayed significant number). This keeps it for e.g. German numbers and Argentine
   * landlines, but hides it for Argentine mobiles, where the international `9` mobile token
   * and the domestic `0 … 15` marker are different encodings and must not be combined
   * (`+54 (0) 9 …` would be wrong). Countries without a droppable `0` trunk prefix (e.g. US
   * with `1`, or Italy where the leading `0` is part of the number) yield an empty string.
   */
  protected readonly nationalPrefix = computed(() => {
    const country = this.selectedCountry();
    const number = this.phoneNumber();
    if (!country || !number) {
      return '';
    }

    if (this.phoneUtil.getNddPrefixForRegion(country.isoCode, true) !== '0') {
      return '';
    }

    const onlyDigits = (value: string): string => value.replace(/\D/g, '');
    const nationalDigits = onlyDigits(this.phoneUtil.format(number, PhoneNumberFormat.NATIONAL));
    const displayedDigits = onlyDigits(this.formatWithoutCountryCode(number));
    return nationalDigits === '0' + displayedDigits ? '0' : '';
  });
  protected readonly countryFocused = signal(false);
  protected open = false;
  protected overlayWidth = 0;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
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
  protected readonly icons = addIcons({ elementDown2 });
  private readonly allowedCountries = computed(
    () => this.supportedCountries() ?? this.phoneUtil.getSupportedRegions()
  );
  private readonly disabledNgControl = signal(false);
  private isValidNumber = true;
  private readonly phoneNumber = signal<PhoneNumber | undefined>(undefined);
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.country) {
      this.writeCountry();
    }
  }

  /** @internal */
  writeValue(value: string | undefined): void {
    this.phoneNumber.set(this.parseNumber(value));
    if (this.phoneNumber()) {
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
    const number = this.phoneNumber();
    if (!number || !this.phoneUtil.isValidNumber(number)) {
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

  protected input(): void {
    const rawNumber = this.phoneInput().nativeElement.value;
    const number = this.parseNumber(rawNumber);
    this.phoneNumber.set(number);

    if (number) {
      const regionCode = this.getRegionCode();
      let countryInfo = this.countryList().find(
        country => regionCode === country.value.isoCode
      )?.value;
      if (!countryInfo && regionCode) {
        countryInfo = {
          name: this.getCountryName(regionCode),
          countryCode: number.getCountryCode()!,
          isoCode: regionCode
        };
      }
      if (countryInfo && this.selectedCountry()?.isoCode !== countryInfo.isoCode) {
        this.selectedCountry.set(countryInfo);
      }
    } else if (rawNumber.trim().startsWith('+')) {
      this.selectedCountry.set(undefined);
    }

    this.handleChange();
  }

  protected blur(): void {
    this.countryFocused.set(false);
    this.onTouched();
    this.writeValueToInput();
    this.valueChange.emit({
      country: this.selectedCountry(),
      phoneNumber: this.formatPhoneNumber(PhoneNumberFormat.INTERNATIONAL),
      isValid: this.isValidNumber
    });
  }

  protected countryInput(num: CountryInfo): void {
    this.selectedCountry.set(num);
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

  private writeCountry(): void {
    const currentCountry = this.country()!;
    let country = this.countryList().find(
      country => country.value.isoCode === currentCountry
    )?.value;
    if (!country) {
      const countryCode = this.phoneUtil.getCountryCodeForRegion(
        currentCountry ?? this.defaultCountry() ?? 'XX'
      );
      if (countryCode) {
        country = {
          isoCode: currentCountry,
          countryCode,
          name: this.getCountryName(currentCountry)
        };
      }
    }
    this.selectedCountry.set(country);
    this.updatePlaceholder();
    this.refreshValueAfterCountryChange();
  }

  private getCountryName(countryCode: string): string {
    // This auto translates the given country name to the selected locale language
    return (
      new Intl.DisplayNames([this.translate.currentLanguage ?? this.locale], { type: 'region' }).of(
        countryCode.toUpperCase()
      ) ?? ''
    );
  }

  private updatePlaceholder(): void {
    if (this.selectedCountry()) {
      this.placeholder = this.formatWithoutCountryCode(
        this.phoneUtil.getExampleNumber(this.selectedCountry()!.isoCode)
      );
    }
  }

  /**
   * Formats the given number in international format but without the leading
   * `+<countryCode>` prefix (which is already shown by the country selector).
   * Unlike the national format, this keeps mobile tokens that only appear in the
   * international representation visible, e.g. the `9` in Argentine mobile numbers
   * (`+54 9 351 ...` instead of the national `0351 15-...`).
   */
  private formatWithoutCountryCode(number: PhoneNumber): string {
    return this.phoneUtil
      .format(number, PhoneNumberFormat.INTERNATIONAL)
      .replace(new RegExp(`^\\+${number.getCountryCode()}\\s*`), '');
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
  private getRegionCode(): string | undefined {
    const number = this.phoneNumber();
    if (number) {
      const regionCode = this.phoneUtil.getRegionCodeForNumber(number);
      if (regionCode) {
        return regionCode;
      }

      const nationalNumber = number.getNationalNumber() + '';
      if (
        // USA, CANADA, ...
        (number.getCountryCode() === 1 && nationalNumber.length >= 3) ||
        // UK, ...
        (number.getCountryCode() === 44 && nationalNumber.length >= 4)
      ) {
        return this.phoneUtil.getRegionCodeForNumber(
          this.phoneUtil.parse(
            '+' +
              number.getCountryCode() +
              nationalNumber +
              new Array(10 - nationalNumber.length).fill(5).join('')
          )
        );
      }

      return this.phoneUtil.getRegionCodeForCountryCode(number.getCountryCode()!);
    }

    return undefined;
  }

  private formatPhoneNumber(format: PhoneNumberFormat): string | undefined {
    const number = this.phoneNumber();
    if (number) {
      return this.phoneUtil.format(number, format);
    }

    return undefined;
  }

  private handleChange(): void {
    const selectedCountry = this.selectedCountry();
    if (selectedCountry && this.country() !== selectedCountry.isoCode) {
      this.country.set(selectedCountry.isoCode);
    }

    if (this.phoneNumber()) {
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
    const number = this.phoneNumber();
    if (number) {
      this.writeTextToInput(this.formatWithoutCountryCode(number));
    }
  }

  private refreshValueAfterCountryChange(): void {
    const selectedCountry = this.selectedCountry();
    if (selectedCountry) {
      this.phoneNumber()?.setCountryCode(selectedCountry.countryCode);
      this.writeValueToInput();
    }
  }
}
