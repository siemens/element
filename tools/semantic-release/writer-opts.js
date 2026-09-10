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

function commitGroupsSort(a, b) {
  return commitGroups.indexOf(a.title) - commitGroups.indexOf(b.title);
}

function noteGroupsSort(a, b) {
  return noteTitles.indexOf(a.title) - noteTitles.indexOf(b.title);
}

function notesSort(a, b) {
  return a.title.localeCompare(b.title);
}

function transform(commit) {
  const hasNotes = Array.isArray(commit.notes) && commit.notes.length > 0;

  const normalizedNotes = hasNotes
    ? commit.notes.map(note => ({
        title: noteTitleMap[note.title] ?? note.title,
        text: note.text.replace(/\n/g, '\n  ')
      }))
    : [];

  if (hiddenTypes.has(commit.type)) {
    if (normalizedNotes.length > 0) {
      const transformedNotes = normalizedNotes.map(note => ({
        ...note,
        text: `${commit.scope ? `**${commit.scope}:** ` : ''}${note.text}`
      }));
      // Add to the pending notes if there are notes and the type is hidden
      // The notes will be added to the context in finalizeContext
      pendingHiddenTypeNotes.push(...transformedNotes);
    }
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
