---
name: git-github
description: Use when committing, branching, creating commit messages or opening pull requests.
---

# Git & GitHub workflow for Siemens Element

This repo (`siemens/element`) follows
Conventional Commits and an Angular-derived convention.
Commit messages drive the changelog, so getting the format right is mandatory.

## Golden rules

- One logical change per commit. Keep the working tree clean.
- When addressing review feedback, fold corrections into the commit that
  introduced the affected change. Do not leave separate review-fix commits
  unless the user explicitly requests them.
- Amend the owning commit, or use fixup commits and autosquash before pushing.
  Preserve unrelated commits and their authorship.
- Do NOT add AI/tool attribution, "Co-authored-by", or marketing footers to
  commit messages or PRs.
- Never commit directly to `main`.
- Commits with type `feat`, `fix`, or `perf` appear in the changelog.
  Reserve these types for consumer-facing changes to the released packages:
  `element-ng`, `element-theme`, `element-translate-ng`, `maps-ng`,
  `charts-ng`, `dashboards-ng`, and `native-charts-ng`.
  Internal changes should use another appropriate type.

## Commit message

Follow the conventional commit guidelines.
Do not use `!` in the header for breaking changes.
Always be aware of the target audiences of the commit.
`feat`/`fix`/`perf` header show up in the changelog.
Write them in a way that they are understandable for consumer not knowing internals of Element.
The body is mainly for ourselves.
Beside a short summary it should also describe the reason why certain decisions were taken.

### Type (required)

| Type       | Meaning                                            | In changelog |
| ---------- | -------------------------------------------------- | ------------ |
| `feat`     | New feature                                        | yes          |
| `fix`      | Bug fix                                            | yes          |
| `perf`     | Performance improvement                            | yes          |
| `fixup`    | Fix of an unreleased feature                       | no           |
| `docs`     | Documentation only                                 | no           |
| `style`    | Formatting/whitespace, no behavior change          | no           |
| `refactor` | Code change that neither fixes a bug nor adds feat | no           |
| `test`     | Add or correct tests                               | no           |
| `build`    | Build system or external dependencies              | no           |
| `ci`       | CI configuration and scripts                       | no           |
| `chore`    | Other changes not touching src/test                | no           |
| `revert`   | Reverts a previous commit                          | no           |

### Scope

- Use the entry-point (folder) name of the component/service: `breadcrumb`,
  `tree-view`, `wizard`, etc.
- For changes in the theme, use the file name: `_forms.scss` --> `forms`
- Non `element-*` packages: Use `/` to narrow within an entry point: `charts/sankey`.
- For cross-component changes use a common scope when possible: `angular`,
  `api`, `a11y`, `ionic`, `i18n`, `theme`, `webcomponents`.
- For dependency changes use the npm package name.
- For everything else determine the scope based on the main change aspect

### Body (required)

Imperative present tense. Explain the motivation and contrast previous vs. new
behavior where helpful.
Keep it short and precise.

### Footer

Holds issue references, breaking changes, and deprecations.

**Issue references** — supported keywords:

- `Closes #<n>` / `Fixes #<n>` — closes the issue
- `See #<n>` — references only
- `See <group/project>#<n>` — cross-project reference

The issue reference must come **before** any breaking-change/deprecation note,
otherwise it gets absorbed into that note in the changelog.

**Breaking change** — requires a scope in the header. Start with
`BREAKING CHANGE:` then summary, blank line, description + migration steps.
Begin the description with a verb (changed, dropped, moved, removed, renamed):

**Deprecation** — same shape, starts with `DEPRECATED:` and includes the
recommended update path.

**Note** — `NOTE:` for important changelog notes that are neither breaking nor
deprecation. Use sparingly.

Breaking/deprecation/note footers surface in the changelog even on
non-changelog types (`docs`, `chore`, `refactor`, ...).
The most be included at end:

```text
Fixes #<issue number>

BREAKING CHANGE: <breaking change summary>

<breaking change description + migration instructions>
```

## Pull requests

- Use `gh` for PR work.
- Target `main` unless told otherwise.
- Push to origin remote.
- Always create DRAFT PRs.
- PR title follows the same Conventional Commit format as a commit header.
- Never include which validation were run locally. We have CI for that.

### PR description

- The commit message is the source of truth.
- For a single-commit PR, copy the commit body and footer into the PR
  description. Exclude only the commit subject.
- Do not summarize, paraphrase, add headings, or append test results.
- If the description needs improvement, improve the commit message first.
- If the commit body is empty, write a proper commit body before creating the PR.
- For multiple commits, identify the appropriate source explicitly; do not
  silently use the latest commit.

For a single-commit PR, copy the subject and body directly from Git:

```bash
git log -1 --format=%b |
  gh pr create \
    --draft \
    --base main \
    --title "$(git log -1 --format=%s)" \
    --body-file -
```
