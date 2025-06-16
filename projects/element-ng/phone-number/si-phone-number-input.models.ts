/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export interface PhoneNumberModel {
  /**
   * Country code
   */
  countryCode?: string;
  /**
   * Phone number
   */
  phoneNumber?: string;
}

/**
 * Describes the country information of the phone number.
 */
export interface CountryInfo {
  /**
   * The name of the country.
   **/
  name: string;
  /**
   * The country dial code
   */
  countryCode: number;
  /**
   * The country ISO code.
   */
  isoCode: string;
}

/**
 * Describes the phone number, its validity and associated country information.
 */
export interface PhoneDetails {
  /**
   * CountryInfo object containing name, countryCode and isoCode of the phone number.
   */
  country?: CountryInfo;
  /**
   * Phone number entered by the user.
   */
  phoneNumber?: string;
  /**
   * Confirms if the phone number is valid or not
   */
  isValid: boolean;
}
