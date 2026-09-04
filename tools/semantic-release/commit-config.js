// To reorder the types, simply change the order of the items
export const commitTypes = [
  { type: 'feat', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'perf', section: 'Performance Improvements' },
  { type: 'revert', section: 'Reverts' },
  { type: 'fixup', hidden: true },
  { type: 'docs', hidden: true },
  { type: 'style', hidden: true },
  { type: 'refactor', hidden: true },
  { type: 'test', hidden: true },
  { type: 'build', hidden: true },
  { type: 'ci', hidden: true },
  { type: 'chore', hidden: true }
];

export const releaseRules = [
  { breaking: true, release: 'major' },
  { revert: true, release: 'patch' },
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' }
];

// The angular preset does not parse the conventional commit `!` marker by default.
export const parserOpts = {
  headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
  headerCorrespondence: ['type', 'scope', 'subject'],
  breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
  // Require the uppercase `KEYWORD:` trailer form to avoid matching prose such as
  // "Deprecated exports" or "note that" as separate release notes.
  notesPattern: noteKeywords => new RegExp(`^[\\s*]*(${noteKeywords}):\\s+(.*)`)
};

// To reorder the notes, simply change the order of the items
export const noteTitleMap = {
  'NOTE': 'NOTES',
  'BREAKING CHANGE': 'BREAKING CHANGES',
  'DEPRECATED': 'DEPRECATIONS'
};

export const noteTitles = Object.values(noteTitleMap);
