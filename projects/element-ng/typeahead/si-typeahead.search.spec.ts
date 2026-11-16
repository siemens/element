/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { signal } from '@angular/core';

import { Match, SearchConfig, typeaheadSearch } from './si-typeahead.search';

describe('typeaheadSearch', () => {
  const search = (
    texts: string[],
    query: string,
    config: SearchConfig = { matchAllTokens: 'separately' }
  ): Match<string>[] =>
    typeaheadSearch(
      () => texts.map(text => ({ text, option: text })),
      () => query,
      () => config
    )();

  it('should preserve match metadata and highlighted segments', () => {
    expect(search(['xx Abc def yy'], 'ab de')).toEqual([
      {
        option: 'xx Abc def yy',
        text: 'xx Abc def yy',
        result: [
          { text: 'xx ', isMatching: false, matches: 0, uniqueMatches: 0 },
          { text: 'Ab', isMatching: true, matches: 1, uniqueMatches: 1 },
          { text: 'c ', isMatching: false, matches: 0, uniqueMatches: 0 },
          { text: 'de', isMatching: true, matches: 1, uniqueMatches: 1 },
          { text: 'f yy', isMatching: false, matches: 0, uniqueMatches: 0 }
        ],
        stringMatch: false,
        atBeginning: false,
        matches: 2,
        uniqueMatches: 2,
        uniqueSeparateMatches: 2,
        matchesEntireQuery: false,
        matchesAllParts: true,
        matchesAllPartsSeparately: true
      }
    ]);
  });

  it('should detect entire-query matches in consecutive options', () => {
    expect(search(['Alpha', 'Alpha Alpha'], 'alpha')).toMatchObject([
      { stringMatch: true, atBeginning: true, matchesEntireQuery: true, matches: 1 },
      { stringMatch: false, atBeginning: true, matchesEntireQuery: true, matches: 2 }
    ]);
  });

  it.each([
    ['no', 1],
    ['once', 1],
    ['separately', 0],
    ['independently', 0]
  ] as const)('should handle overlapping tokens in %s mode', (matchAllTokens, count) => {
    const matches = search(['abc'], 'ab bc', { matchAllTokens });
    expect(matches).toHaveLength(count);
  });

  it('should merge overlapping highlights and count their distinct tokens', () => {
    expect(search(['abc'], 'ab bc', { matchAllTokens: 'once' })).toMatchObject([
      {
        result: [{ text: 'abc', isMatching: true, matches: 2, uniqueMatches: 2 }],
        uniqueSeparateMatches: 1,
        matchesAllParts: true,
        matchesAllPartsSeparately: false
      }
    ]);
  });

  it('should keep adjacent segments separate unless independent matches are required', () => {
    expect(search(['abc'], 'ab c')).toMatchObject([
      {
        result: [
          { text: 'ab', isMatching: true },
          { text: 'c', isMatching: true }
        ],
        uniqueSeparateMatches: 2
      }
    ]);
    expect(search(['abc'], 'ab c', { matchAllTokens: 'independently' })).toEqual([]);
  });

  it.each(['no', 'once', 'separately', 'independently'] as const)(
    'should skip already matched tokens when counting separate matches in %s mode',
    matchAllTokens => {
      expect(search(['a a b'], 'a b', { matchAllTokens })).toMatchObject([
        {
          matches: 3,
          uniqueSeparateMatches: 2,
          matchesAllParts: true,
          matchesAllPartsSeparately: true
        }
      ]);
    }
  );

  it('should reassign an earlier segment to allow another token to match separately', () => {
    expect(search(['ab a'], 'a ab')).toMatchObject([
      { uniqueSeparateMatches: 2, matchesAllPartsSeparately: true }
    ]);
  });

  it.each(['separately', 'independently'] as const)(
    'should require a separate occurrence for every repeated query token in %s mode',
    matchAllTokens => {
      expect(search(['a a'], 'a a a', { matchAllTokens })).toEqual([]);
      expect(search(['a a a'], 'a a a', { matchAllTokens })).toMatchObject([
        { uniqueSeparateMatches: 3, matchesAllPartsSeparately: true }
      ]);
    }
  );

  it('should count separate matches even when some query tokens are missing', () => {
    expect(search(['a a b'], 'a b c', { matchAllTokens: 'no' })).toMatchObject([
      { uniqueSeparateMatches: 2, matchesAllParts: false, matchesAllPartsSeparately: false }
    ]);
    expect(search(['a a b'], 'a b c', { matchAllTokens: 'once' })).toEqual([]);
  });

  it('should handle many repeated query tokens without enumerating their permutations', () => {
    const text = Array(32).fill('a').join(' ');
    expect(search([text], text)).toMatchObject([
      {
        matches: 32 * 32,
        uniqueMatches: 32 * 32,
        uniqueSeparateMatches: 32,
        matchesAllPartsSeparately: true
      }
    ]);
  });

  it('should handle long lists of non-overlapping segments', () => {
    const text = Array(3000).fill('a').join(' ');
    const matches = search([text], 'a');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ matches: 3000, uniqueSeparateMatches: 1 });
    expect(matches[0].result).toHaveLength(5999);
    expect(matches[0].result.map(segment => segment.text).join('')).toEqual(text);
  });

  it('should escape regular-expression characters', () => {
    const text = '|\\{}()[\\]^$+*?.';
    expect(search([text, 'other'], text)).toMatchObject([
      { text, stringMatch: true, matchesEntireQuery: true, matches: 1 }
    ]);
  });

  it('should match the full query when tokenization is disabled', () => {
    expect(
      search(['New York', 'York New'], 'New York', {
        matchAllTokens: 'separately',
        disableTokenizing: true
      })
    ).toMatchObject([{ text: 'New York', matches: 1, uniqueSeparateMatches: 1 }]);
  });

  it.each(['', ' \t '])('should return unhighlighted options for query %j', query => {
    expect(search(['', 'Alpha'], query)).toMatchObject([
      { text: '', result: [], matches: 0 },
      {
        text: 'Alpha',
        result: [{ text: 'Alpha', isMatching: false, matches: 0, uniqueMatches: 0 }],
        matches: 0
      }
    ]);
  });

  it('should update matches when the query, options, or configuration change', () => {
    const options = signal([{ text: 'abc', option: { id: 1 } }]);
    const query = signal('ab');
    const config = signal<SearchConfig>({ matchAllTokens: 'separately' });
    const matches = typeaheadSearch(options, query, config);
    expect(matches()[0].option).toBe(options()[0].option);
    expect(matches()).toHaveLength(1);

    query.set('ab c');
    expect(matches()).toHaveLength(1);
    config.set({ matchAllTokens: 'independently' });
    expect(matches()).toEqual([]);
    options.set([{ text: 'ab c', option: { id: 2 } }]);
    expect(matches()).toMatchObject([{ option: { id: 2 }, matchesAllPartsSeparately: true }]);
  });

  it('should wait for option updates before using a new lazy query', () => {
    const options = signal([{ text: 'Alpha', option: 'Alpha' }]);
    const query = signal('al');
    const matches = typeaheadSearch(options, query, () => ({
      matchAllTokens: 'separately',
      lazy: true
    }));
    const initialMatches = matches();

    query.set('be');
    expect(matches()).toBe(initialMatches);
    options.set([{ text: 'Beta', option: 'Beta' }]);
    expect(matches()).toMatchObject([{ text: 'Beta', matchesEntireQuery: true }]);
  });
});
