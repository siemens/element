import { commitTypes, noteTitleMap, noteTitles } from './commit-config.js';

const COMMIT_HASH_LENGTH = 7;

const commitGroups = commitTypes.map(t => t.section).filter(Boolean);

const hiddenTypes = new Set();
const visibleTypes = {};

commitTypes.forEach(({ type, section, hidden }) => {
  if (hidden) {
    hiddenTypes.add(type);
  } else if (section) {
    visibleTypes[type] = section;
  }
});

/**
 * Notes of hidden-type commits, collected while `transform` runs over the commits of a
 * release and consumed by `finalizeContext` once that release is rendered.
 *
 * `finalizeContext` must always drain this buffer. semantic-release reuses a single
 * writerOpts object for every `generateNotes` call - it runs once per release that is added
 * to a channel plus once for the new release - so anything left behind would be re-emitted
 * into the notes of the following release.
 */
let pendingHiddenTypeNotes = [];

/** Identity of a note, used to drop notes that several commits describe identically. */
const noteIdentity = note => `${note.title}\u0000${note.text}`;

/** The `**scope:**` prefix that `transform` puts in front of every note text. */
const noteScope = note => {
  const match = /^\*\*(.+?):\*\* /.exec(note.text);
  return match ? match[1] : '';
};

function commitGroupsSort(a, b) {
  return commitGroups.indexOf(a.title) - commitGroups.indexOf(b.title);
}

function noteGroupsSort(a, b) {
  return noteTitles.indexOf(a.title) - noteTitles.indexOf(b.title);
}

/**
 * Notes are already grouped by title, so sorting by title would be a no-op. Sort by scope
 * instead to keep entries about the same scope next to each other.
 */
function notesSort(a, b) {
  return noteScope(a).localeCompare(noteScope(b)) || a.text.localeCompare(b.text);
}

function transform(commit) {
  // The default footer template renders a bare `* {{text}}`, so the scope has to be part of
  // the note text. Doing this for every commit type keeps the notes consistently scoped and
  // lets `notesSort` group them by scope.
  const prefix = commit.scope ? `**${commit.scope}:** ` : '';

  const normalizedNotes = Array.isArray(commit.notes)
    ? commit.notes.map(note => ({
        title: noteTitleMap[note.title] ?? note.title,
        text: `${prefix}${note.text.replace(/\n/g, '\n  ')}`
      }))
    : [];

  if (hiddenTypes.has(commit.type)) {
    // Hidden commits are dropped from the changelog, but their notes still belong in it.
    // finalizeContext merges them into the note groups once all commits are transformed.
    pendingHiddenTypeNotes.push(...normalizedNotes);
    return;
  }

  const shortHash =
    typeof commit.hash === 'string'
      ? commit.hash.substring(0, COMMIT_HASH_LENGTH)
      : commit.shortHash;

  return {
    ...commit,
    notes: normalizedNotes,
    references: commit.references.map(reference => ({
      ...reference,
      isCve: reference.prefix === 'CVE-'
    })),
    type: visibleTypes[commit.type],
    shortHash
  };
}

/**
 * Append the collected notes of hidden-type commits to the matching note groups, drop
 * duplicates and restore the group and note order.
 */
function finalizeContext(context) {
  const pending = pendingHiddenTypeNotes;
  pendingHiddenTypeNotes = [];

  const seen = new Set();

  for (const group of context.noteGroups) {
    group.notes = group.notes.filter(note => {
      const identity = noteIdentity(note);
      if (seen.has(identity)) {
        return false;
      }
      seen.add(identity);
      return true;
    });
  }

  for (const note of pending) {
    const identity = noteIdentity(note);
    if (seen.has(identity)) {
      continue;
    }
    seen.add(identity);

    let group = context.noteGroups.find(g => g.title === note.title);
    if (!group) {
      group = { title: note.title, notes: [] };
      context.noteGroups.push(group);
    }
    group.notes.push(note);
  }

  // The writer sorts note groups and notes before finalizeContext runs, so both have to be
  // sorted again now that the hidden-type notes are merged in.
  context.noteGroups = context.noteGroups.filter(group => group.notes.length > 0);
  context.noteGroups.sort(noteGroupsSort);
  context.noteGroups.forEach(group => group.notes.sort(notesSort));

  return context;
}

const commitPartial = `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}}
{{~#if @root.linkReferences}} ([{{shortHash}}]({{#if @root.repository}}{{@root.host}}/{{@root.owner}}/{{@root.repository}}{{else}}{{@root.repoUrl}}{{/if}}/commit/{{hash}})){{else}} {{shortHash}}{{/if}}
{{~#if references}}, closes{{#each references}} {{#if isCve}}[{{prefix}}{{issue}}](https://nvd.nist.gov/vuln/detail/{{prefix}}{{issue}}){{else}}[{{prefix}}{{issue}}]({{#if @root.repository}}{{@root.host}}/{{#if repository}}{{owner}}/{{repository}}{{else}}{{@root.owner}}/{{@root.repository}}{{/if}}{{else}}{{@root.repoUrl}}{{/if}}/issues/{{issue}}){{/if}}{{/each}}{{/if}}
`;

export default {
  transform,
  finalizeContext,
  commitPartial,
  commitGroupsSort,
  commitsSort: ['scope', 'subject'],
  noteGroupsSort,
  notesSort
};
