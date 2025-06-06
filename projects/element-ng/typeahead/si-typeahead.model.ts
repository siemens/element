/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Observable } from 'rxjs';

/**
 * A singular item to be used in the typeahead.
 * Can be either a string or an object.
 */
export type TypeaheadOption = string | { [key in string | number]: any };
/**
 * An array of {@link TypeaheadOption}.
 */
export type TypeaheadArray = TypeaheadOption[];
/**
 * An observable of a {@link TypeaheadArray} (array of {@link TypeaheadOption}).
 */
export type TypeaheadObservable = Observable<TypeaheadArray>;
/**
 * Either a {@link TypeaheadObservable} (observable of a {@link TypeaheadArray}) or a {@link TypeaheadArray}.
 */
export type Typeahead = TypeaheadArray | TypeaheadObservable;

/**
 * A segment of a {@link TypeaheadMatch}, which is a matching or non-matching segment of a typeahead option.
 */
export interface MatchSegment {
  text: string;
  isMatching: boolean;
  matches: number;
  uniqueMatches: number;
}

/**
 * A typeahead match, which is a processed typeahead option.
 */
export interface TypeaheadMatch {
  option: TypeaheadOption;
  text: string;
  result: MatchSegment[];
  stringMatch: boolean;
  atBeginning: boolean;
  matches: number;
  uniqueMatches: number;
  uniqueSeparateMatches: number;
  matchesEntireQuery: boolean;
  matchesAllParts: boolean;
  matchesAllPartsSeparately: boolean;
  itemSelected?: boolean;
  iconClass?: string;
}

/**
 * An interface to define the context of a typeahead item template
 */
export interface TypeaheadOptionItemContext {
  item: TypeaheadOption;
  index: number;
  match: TypeaheadMatch;
  query: string;
}
