/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { formatDate } from '@angular/common';
import { isValid } from '@siemens/element-ng/datepicker';

import { CriterionDefinition, OptionCriterion, OptionType } from './si-filtered-search.model';

export interface TypeaheadOptionCriterion extends OptionCriterion {
  selected?: boolean;
  translatedLabel: string;
}

export interface InternalCriterionDefinition extends CriterionDefinition {
  label: string;
  translatedLabel: string;
}

/** Convert options to option criterions */
export const toOptionCriteria = (values?: OptionType[]): OptionCriterion[] =>
  values?.map(v =>
    typeof v === 'string'
      ? { value: v }
      : { label: v.label, value: v.value, iconClass: v.iconClass }
  ) ?? [];

/*
 * Update selected state the matching is based on value since plain
 * string options will automatically fill the value attribute with the
 * actual string value.
 */
export const selectOptions = (options: TypeaheadOptionCriterion[], toSelect: string[]): void =>
  options.forEach(val => (val.selected = toSelect.includes(val.value)));

/**
 * Difference by name, create an array that contains those elements of criteria's a that are not in criteria's b.
 * This operation is also sometimes called minus (-).
 */
export const differenceByName = (
  a: InternalCriterionDefinition[],
  b: { config: InternalCriterionDefinition }[]
): InternalCriterionDefinition[] =>
  a.filter(x => b.filter(y => y.config.name === x.name).length === 0);

/** Convert criteria to internal model criteria */
export const toInternalCriteria = (crit: CriterionDefinition): InternalCriterionDefinition => {
  return {
    ...crit,
    label: crit.label ?? crit.name,
    translatedLabel: crit.label ?? crit.name
  };
};

export const getISODateString = (
  date: Date | undefined,
  format: 'date' | 'date-time',
  locale: string
): string => {
  if (!isValid(date)) {
    return '';
  }

  switch (format) {
    case 'date':
      return formatDate(date, 'yyyy-MM-dd', locale);
    case 'date-time':
      return date.toISOString();
  }
};
