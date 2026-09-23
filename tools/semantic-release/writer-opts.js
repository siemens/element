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

function transform(commit) {
  const hasNotes = Array.isArray(commit.notes) && commit.notes.length > 0;

  const normalizedNotes = hasNotes
    ? commit.notes.map(note => ({
        title: noteTitleMap[note.title] ?? note.title,
        // PyMarkdown used in MKDocs is very strict with list formatting. Text bodies must be
        // indented by 4 spaces and there must be an empty line before the next list item.
        text: `${note.text
          .replace(/\r?\n[ \t]*(?=\r?\n|$)/g, '\n') // empty lines can stay empty
          .replace(/\r?\n(?=[^\r\n])/g, '\n    ')}\n`
      }))
    : [];

  const onlyFooter = hiddenTypes.has(commit.type);
  if (onlyFooter && !hasNotes) {
    return;
  }

  const shortHash =
    typeof commit.hash === 'string'
      ? commit.hash.substring(0, COMMIT_HASH_LENGTH)
      : commit.shortHash;

  return {
    ...commit,
    notes: normalizedNotes,
    onlyFooter,
    references: commit.references.map(reference => ({
      ...reference,
      isCve: reference.prefix === 'CVE-'
    })),
    // An empty type prevents a section heading for footer-only commits.
    type: onlyFooter ? '' : visibleTypes[commit.type],
    shortHash
  };
}

const commitPartial = `{{#unless onlyFooter}}* {{#if scope}}**{{scope}}:** {{/if}}{{subject}}
{{~#if @root.linkReferences}} ([{{shortHash}}]({{#if @root.repository}}{{@root.host}}/{{@root.owner}}/{{@root.repository}}{{else}}{{@root.repoUrl}}{{/if}}/commit/{{hash}})){{else}} {{shortHash}}{{/if}}
{{~#if references}}, closes{{#each references}} {{#if isCve}}[{{prefix}}{{issue}}](https://nvd.nist.gov/vuln/detail/{{prefix}}{{issue}}){{else}}[{{prefix}}{{issue}}]({{#if @root.repository}}{{@root.host}}/{{#if repository}}{{owner}}/{{repository}}{{else}}{{@root.owner}}/{{@root.repository}}{{/if}}{{else}}{{@root.repoUrl}}{{/if}}/issues/{{issue}}){{/if}}{{/each}}{{/if}}
{{/unless}}`;

export default {
  transform,
  commitPartial,
  commitGroupsSort(a, b) {
    return commitGroups.indexOf(a.title) - commitGroups.indexOf(b.title);
  },
  commitsSort: ['scope', 'subject'],
  noteGroupsSort(a, b) {
    return noteTitles.indexOf(a.title) - noteTitles.indexOf(b.title);
  },
  notesSort(a, b) {
    return a.title.localeCompare(b.title);
  }
};
