/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Signal, untracked } from '@angular/core';

export interface SearchOptions<T> {
  /** The text that will be used for searching. */
  text: string;
  /** The raw option that will be also included in the Match results */
  option: T;
}

export interface MatchSegment {
  text: string;
  isMatching: boolean;
  matches: number;
  uniqueMatches: number;
}

export interface Match<T> {
  option: T;
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
}

export interface SearchConfig {
  /** Defines whether to tokenize the search or match the whole search. */
  disableTokenizing?: boolean;
  /**
   * Defines whether and how to require to match with all the tokens if {@link typeaheadTokenize} is enabled.
   * - `no` does not require all of the tokens to match.
   * - `once` requires all of the parts to be found in the search.
   * - `separately` requires all of the parts to be found in the search where there is not an overlapping different result.
   * - `independently` requires all of the parts to be found in the search where there is not an overlapping or adjacent different result.
   *  ('independently' also slightly changes sorting behavior in the same way.)
   */
  matchAllTokens: 'no' | 'once' | 'separately' | 'independently';
  /**
   * When enabled, the search output will only be updated, if the options are changed.
   * Query changes will not trigger an update.
   *
   * Use this when lazy loading the options, so the search need to wait, until the options are loaded.
   */
  lazy?: boolean;
}

/**
 * Constructs a typeahead search and provides the matches as a signal.
 *
 * @param options - Factory function that should return the array of options to search in.
 * Is run in a reactive context.
 * @param query - Factory function that should return the current search query. Is run in a reactive context.
 * @param config - Configuration for the search. Is run in a reactive context.
 *
 * @example
 * In a real world, myOptions and mayQuery would be signals.
 * ```ts
 * const search = typeaheadSearch(
 *   () => myOptions().map(...),
 *   () => myQuery().toLowerCase(),
 *   () => ({ matchAllTokens: 'separately' })
 * )
 * ```
 */
export const typeaheadSearch = <T>(
  options: () => SearchOptions<T>[],
  query: () => string,
  config: () => SearchConfig
): Signal<Match<T>[]> => computed(() => new TypeaheadSearch<T>(options, query, config()).matches());

class TypeaheadSearch<T> {
  readonly matches = computed<Match<T>[]>(() => this.search(this.datasource(), this.readQuery()));

  constructor(
    private readonly datasource: () => SearchOptions<T>[],
    private readonly query: () => string,
    private readonly options: SearchConfig
  ) {}

  private readQuery(): string {
    if (this.options.lazy) {
      return untracked(() => this.query());
    } else {
      return this.query();
    }
  }

  private escapeRegex(query: string): string {
    return query.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }

  private search(options: SearchOptions<T>[], query: string): Match<T>[] {
    try {
      const entireQueryRegex = new RegExp(this.escapeRegex(query), 'gi');

      const queryParts = !this.options.disableTokenizing
        ? query.split(/\s+/g).filter(queryPart => queryPart)
        : query
          ? [query]
          : [];

      const queryRegexes = queryParts.map(
        queryPart => new RegExp(this.escapeRegex(queryPart), 'gi')
      );
      // Process the options.
      const matches: Match<T>[] = [];
      options.forEach(option => {
        const optionValue = option.text;
        const stringMatch =
          optionValue.toLocaleLowerCase().trim() === query.toLocaleLowerCase().trim();
        const candidate: Match<T> = {
          option: option.option,
          text: optionValue,
          result: [],
          stringMatch,
          atBeginning: false,
          matches: 0,
          uniqueMatches: 0,
          uniqueSeparateMatches: 0,
          matchesEntireQuery: false,
          matchesAllParts: false,
          matchesAllPartsSeparately: false
        };

        // Only search the options if a part of the query is at least one character long to prevent an endless loop.
        if (queryParts.length === 0) {
          if (optionValue) {
            candidate.result.push({
              text: optionValue,
              isMatching: false,
              matches: 0,
              uniqueMatches: 0
            });
          }
          matches.push(candidate);
        } else {
          const allResults: { index: number; start: number; end: number; result: string }[] = [];
          const allIndexes: number[] = [];

          candidate.matchesEntireQuery = !!optionValue.match(entireQueryRegex);

          // Loop through the option value to find multiple matches, then store every segment (matching or non-matching) in the results.
          queryRegexes.forEach((queryRegex, index) => {
            let regexMatch = queryRegex.exec(optionValue);

            while (regexMatch) {
              allResults.push({
                index,
                start: regexMatch.index,
                end: regexMatch.index + regexMatch[0].length,
                result: regexMatch[0]
              });
              if (!regexMatch.index) {
                candidate.atBeginning = true;
              }
              if (!allIndexes.includes(index)) {
                allIndexes.push(index);
              }
              regexMatch = queryRegex.exec(optionValue);
            }
          });

          candidate.matchesAllParts = allIndexes.length === queryParts.length;

          // Check if all parts of the query match at least once (if required).
          if (this.options.matchAllTokens === 'no' || candidate.matchesAllParts) {
            const combinedResults: {
              indexes: number[];
              uniqueIndexes: number[];
              start: number;
              end: number;
              result: string;
            }[] = [];

            // First combine intersecting (or if set to independently adjacent) results to combined results.
            // We achieve this by first sorting them by the starting index, then by the ending index and then looking for overlaps.
            allResults
              .sort((a, b) => a.start - b.start || a.end - b.end)
              .forEach(result => {
                if (combinedResults.length) {
                  const foundPreviousResult = combinedResults.find(previousResult =>
                    this.options.matchAllTokens === 'independently'
                      ? result.start <= previousResult.end
                      : result.start < previousResult.end
                  );
                  if (foundPreviousResult) {
                    foundPreviousResult.result += result.result.slice(
                      foundPreviousResult.end - result.start,
                      result.result.length
                    );
                    if (result.end > foundPreviousResult.end) {
                      foundPreviousResult.end = result.end;
                    }
                    foundPreviousResult.indexes.push(result.index);
                    if (!foundPreviousResult.uniqueIndexes.includes(result.index)) {
                      foundPreviousResult.uniqueIndexes.push(result.index);
                    }
                    return;
                  }
                }
                combinedResults.push({
                  ...result,
                  indexes: [result.index],
                  uniqueIndexes: [result.index]
                });
              });

            // Recursively go through all unique combinations of the unique indexes to get the option which has the most indexes.
            const countUniqueSubindexes = (
              indexIndex = 0,
              previousIndexes: number[] = []
            ): number =>
              indexIndex === combinedResults.length
                ? previousIndexes.length
                : Math.max(
                    previousIndexes.length,
                    ...combinedResults[indexIndex].uniqueIndexes
                      .filter(index => !previousIndexes.includes(index))
                      .map(index =>
                        countUniqueSubindexes(indexIndex + 1, [index, ...previousIndexes])
                      )
                  );

            candidate.uniqueSeparateMatches = countUniqueSubindexes();
            candidate.matchesAllPartsSeparately =
              candidate.uniqueSeparateMatches === queryParts.length;

            let currentPreviousEnd = 0;

            // Add the combined results to the candidate including the non-matching parts in between.
            combinedResults.forEach(result => {
              const textBefore = optionValue.slice(currentPreviousEnd, result.start);
              if (textBefore) {
                candidate.result.push({
                  text: textBefore,
                  isMatching: false,
                  matches: 0,
                  uniqueMatches: 0
                });
              }
              candidate.result.push({
                text: result.result,
                isMatching: true,
                matches: result.indexes.length,
                uniqueMatches: result.uniqueIndexes.length
              });
              currentPreviousEnd = result.end;
              candidate.matches += result.indexes.length;
              candidate.uniqueMatches += result.uniqueIndexes.length;
            });

            // Check if there are result segments and all parts are matched independently (if required).
            if (
              candidate.result.length !== 0 &&
              ((this.options.matchAllTokens !== 'separately' &&
                this.options.matchAllTokens !== 'independently') ||
                candidate.matchesAllPartsSeparately)
            ) {
              const textAtEnd = optionValue.slice(currentPreviousEnd);
              if (textAtEnd) {
                candidate.result.push({
                  text: textAtEnd,
                  isMatching: false,
                  matches: 0,
                  uniqueMatches: 0
                });
              }
              matches.push(candidate);
            }
          }
        }
      });

      return matches;
    } catch {
      // Could not create regex (only in extremely rare cases, maybe even impossible), so return an empty array.
      return [];
    }
  }
}
