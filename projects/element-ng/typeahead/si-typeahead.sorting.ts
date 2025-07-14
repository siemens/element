/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TypeaheadMatch } from './si-typeahead.model';

export class SiTypeaheadSorting {
  sortMatches(matches: TypeaheadMatch[]): TypeaheadMatch[] {
    // Sort the matches,
    // first is the option and query an exact match.
    // then according to whether it is matching in the beginning,
    // then whether it matches the entire untokenized query.
    // then according to how many unique separate matches it contains.
    // then according to how many unique matches it contains.
    // then according to how many matches it contains.
    return matches.sort((matchA, matchB) => {
      if (matchA.stringMatch || matchB.stringMatch) {
        return matchA.stringMatch ? -1 : 1;
      }
      if (matchA.atBeginning) {
        return !matchB.atBeginning ? -1 : this.compareMatches(matchA, matchB);
      } else {
        return matchB.atBeginning ? 1 : this.compareMatches(matchA, matchB);
      }
    });
  }

  private compareMatchesNumbers(matchA: TypeaheadMatch, matchB: TypeaheadMatch): number {
    return (
      matchB.uniqueSeparateMatches - matchA.uniqueSeparateMatches ||
      matchB.uniqueMatches - matchA.uniqueMatches ||
      matchB.matches - matchA.matches
    );
  }

  private compareMatches(matchA: TypeaheadMatch, matchB: TypeaheadMatch): number {
    if (matchA.matchesEntireQuery) {
      return !matchB.matchesEntireQuery ? -1 : this.compareMatchesNumbers(matchA, matchB);
    } else {
      return matchB.matchesEntireQuery ? 1 : this.compareMatchesNumbers(matchA, matchB);
    }
  }
}
