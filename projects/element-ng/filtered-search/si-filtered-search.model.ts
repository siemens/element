/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DatepickerInputConfig } from '@siemens/element-ng/datepicker';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export type ValidationType = 'string' | 'integer' | 'float' | 'date' | 'date-time';

/**
 * A CriterionValue is the input/output value of the {@link SiFilteredSearchComponent}, containing the user input.
 */
export interface CriterionValue {
  /**
   * The mandatory name of a criterion.
   */
  name: string;
  /**
   * This property holds the selected or entered operator of the criterion.
   */
  operator?: string;
  /**
   * The value property holds the selected or entered value/values of the criterion.
   * The value can also be passed as an array of strings. When `multiSelect` is enabled,
   * the items in the value array will be shown as selected values in value input and the typeahead.
   */
  value?: string | string[];
  /** If the criterion was defined as date or date-time this field will contain the value das js Date. */
  dateValue?: Date;
}

/**
 * A CriterionDefinition is the definition of criteria in the {@link SiFilteredSearchComponent}.
 * It defines the type and based this further attributes
 * like multiselect and available options.
 */
export interface CriterionDefinition {
  /**
   * The mandatory name of a criterion.
   */
  name: string;
  /**
   * An optional label, which is used in the user interface.
   */
  label?: TranslatableString;
  /**
   * The options provide possible values that the user can select for this criterion.
   */
  options?: OptionType[];
  /**
   * This provides possible operators that the user can select for this criterion.
   */
  operators?: string[];
  /**
   * This provides the value type of the input field.
   */
  validationType?: ValidationType;
  /**
   * Optional configuration object for the datepicker.
   */
  datepickerConfig?: DatepickerInputConfig;
  /**
   * Limit criterion options to the predefined ones.
   */
  strictValue?: boolean;
  /**
   * Limit criterion options to the predefined ones and prevent typing. `onlySelectValue`
   * enforces `strictValue` to true automatically.
   */
  onlySelectValue?: boolean;
  /**
   * Defines whether multi selection of the options is possible in a typeahead. Setting it to `true`
   * enables the checkbox besides the option values. When `multiSelect` is `true`,
   * the value input field will be readonly, allowing user to select the values only from the typeahead.
   */
  multiSelect?: boolean;
}

/**
 * @deprecated Use one the more specific types instead:
 * - {@link CriterionValue} for the output value of the FilteredSearch, containing the user input.
 * - {@link CriterionDefinition} for the definition of criteria so the [criteria] input of the {@link SiFilteredSearchComponent}.
 */
export type Criterion = CriterionValue & CriterionDefinition;

/**
 * Type for options
 */
export type OptionType = string | OptionCriterion;

/**
 * It allows to specify a different value between the one which is rendered
 * and the one which is used for the search.
 */
export interface OptionCriterion {
  /**
   * The label to show
   */
  label?: TranslatableString;
  /**
   * The value to use on searching
   */
  value: string;
  /**
   * The icon to be displayed besides value in the typeahead
   */
  iconClass?: string;

  /**
   * Shows whether the option is selected in the multi-select dropdown
   */
  selected?: boolean;
}

/**
 * On search, the filtered search component emits a SearchCriteria object.
 * It consists of all user selected criteria and the free text input value.
 */
export interface SearchCriteria {
  /**
   * The selected criteria of the filtered search. Each criteria has a name
   * and a value.
   */
  criteria: (CriterionValue & Criterion)[];
  /**
   * Additional unstructured free text, which the user entered in the search.
   */
  value: string;
}

/**
 * Event allows to intercept and change the displayed criteria before shown in typeahead.
 */
export interface DisplayedCriteriaEventArgs {
  /**
   * List of criteria names to display in typeahead.
   */
  criteria: string[];
  /**
   * Current search criteria.
   */
  searchCriteria: SearchCriteria;
  /**
   * Interceptor function allows to reduce the list of displayed criteria.
   * @param criteriaNamesToDisplay - list of criteria names to be displayed.
   */
  allow(criteriaNamesToDisplay: string[]): void;
}
