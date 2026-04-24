# Element Code Review Style Guide

This project uses `@siemens/element-ng` (Siemens Element design system). Apply the following
conventions and best practices when reviewing code.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Use signal queries (`viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`) instead of decorator queries (`@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren`)
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator. Only flag this for **newly added** components in the PR. Do NOT flag existing components that are missing it — adding OnPush to existing components is out of scope for a PR review.
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Do NOT use `effect()` for propagation of state changes — this leads to `ExpressionChangedAfterItHasBeenChecked` errors, infinite circular updates, or unnecessary change detection cycles. Use `computed()` instead to model state that depends on other state

## Async Test Stabilization

- Prefer `await fixture.whenStable()` over repeated `fixture.detectChanges()` calls after interactions or async state changes
- `whenStable()` waits for pending microtasks, timers, and zone activity to settle, producing more reliable tests than manually pumping change detection
- Use `fixture.detectChanges()` deliberately for the initial render or when the change detection boundary itself is under test
- Do NOT chain multiple `detectChanges()` calls hoping to flush async work — use `whenStable()` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

---

## UX Writing Guidelines

Review all user-facing text (labels, buttons, messages, tooltips, titles, empty states, dialogs) against
these Siemens UX writing guidelines.

### Style and Tone

- Use as few words as possible
- Use simple, specific, clear, and informative wording
- Use the same words and grammatical forms, lengths, and styles repeatedly
- Use natural, conversational language — not robotic, funny, cool, or clever
- Avoid talking to the user directly on the UI
- Address users in second-person (you) and first-person plural for the application (we) only in formal contexts (emails, app tour)
- Use gender-neutral language (their, them, theirs, salesperson — not his, hers, him, salesman)
- Avoid 'please', 'sorry' and other forms of apology
- Use positive instead of negative framing
- Avoid using contractions (use "cannot" not "can't", "will not" not "won't")

### Length

- Use sentences only when necessary
- Use short words (3–5 letters) instead of long words (8+)
- Keep sentences under 25 words (average 15)
- Keep titles under 65 characters (including spaces)

### Capitalization

- Capitalize only the first letter of the first word in titles, tooltips, menu items, list items, and buttons
- Do not use all-caps (e.g., `PLANNING` → `Planning`)
- Capitalize proper nouns (places, organizations, products, tools, languages)
- Capitalize named app functions and UI elements: "Go to Settings", "Press OK"

### Grammar

- Use present simple tense for actions and instructions (click, browse, upload)
- Use present participle with ellipsis for ongoing progress (Uploading…)
- Use active voice ("Configuration file opens" not "The configuration file is opened")
- Use "click" not "press"; use "hover" not "mouse over"
- Avoid multi-word phrasal verbs when one word works ("remove" not "get rid of", "calculate" not "add up", "retrieve data" not "fetch data")

### Time-Based Vocabulary

- Use "latest" (most recent, more may follow) not "last" (implies nothing else will follow)
- Use "recent" for time-focused references
- Avoid "last", "latest", "recent" if the verb relates to a timestamp

### Punctuation

- Minimize punctuation — always consider whether it is necessary
- Exclamation marks for high-level warnings only
- Avoid question marks in modal titles
- Avoid colons whenever possible (e.g., "User name" not "User name:")
- Avoid full sentences on interactive UI pages — use telegram style without a trailing full stop
- Use ellipsis only for transitional text (e.g., "Uploading…")
- No space before %, colon, semi-colon, or ellipsis
- Add a space before units of measurement (e.g., "30 mm")

### Abbreviations and Acronyms

- Avoid abbreviations (info, incl, excl) and acronyms
- Explain acronyms initially and in full unless well known: "Asset Performance Suite (APS)"
- No periods in abbreviations or acronyms
- Never make up your own acronyms

### Common UX Wording Mistakes

- "time zone" not "timezone"
- "log file" not "logfile"
- "log in" as a verb, "login" as a noun
- "equipment" not "equipments"; "feedback" not "feedbacks"; "training" not "trainings"
- "current" not "actual" (avoid misunderstandings with electricity)
- Avoid "shall" — use "can", "must", or "should"

### Inappropriate and Forbidden Terms

- Use "Manager", "Lead", "Primary" — not "Master"
- Use "Subordinate", "Secondary" — not "Slave"
- Use "Block-list" not "Blacklist"; "Allow-list" not "Whitelist"
- Use "Cancel", "Stop", "End" — not "Abort"
- Use "Disrupt", "Remove" — not "Kill"
- Use "End", "Stop", "Finish" — not "Terminate"
- Use "Run", "Perform", "Carry out" — not "Execute"

### Error Messages

- Three parts: 1. title 2. explanation 3. action
- Avoid using the word "error" or "warning" — these are superfluous when design elements (icons, color) convey severity
- Do not blame the user
- Avoid "Try again" and "Contact administrator" unless there is a good chance it will help
- Avoid "success", "successful", "successfully" — they are superfluous
- Avoid "information" as a title

### Dialogs and Buttons

- Use concise, descriptive dialog titles (e.g., "Add user", "Delete file")
- Button labels should describe the action and relate to the dialog title (Cancel, Add / Cancel, Delete)
- Avoid "Yes" and "No" as buttons — use clear action verbs
- Only use "OK" if no appropriate verb exists
- Primary button on the right, secondary on the left (Cancel, Save — not Save, Cancel)
- In confirmation dialogs, formulate a question aimed at the primary action

### Empty States

- Use three parts: 1. title 2. explanation 3. action
- Tell the user the empty space is intentional (not an error)
- Use wording to move the user forward and help them resolve the empty state

### Transitional Text

- Use -ing verbs and ellipsis (e.g., "Updating user roles…")
- Confirmation messages should use the same verb (e.g., "Saving project…" → "Project saved")
- Do not use informal transitional wording (e.g., avoid "Getting ready…")

### Common Actions Terminology

- "Create" + "Delete" go together (usually permanent, cannot be restored)
- "Add" + "Remove" go together (usually reversible, can be restored)
- Do not mix Delete and Remove as synonyms

---

## Contribution Guidelines

PRs must follow the project's contribution guidelines documented in `CONTRIBUTING.md`.

### Commit Message Format

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) based on the
Angular convention.

Format: `<type>(<scope>): <subject>`

#### Allowed Types

- **feat**: A new feature (appears in changelog)
- **fix**: A bug fix (appears in changelog)
- **fixup**: Fix of an unreleased feature (not in changelog)
- **docs**: Documentation only changes
- **style**: Formatting changes (white-space, semi-colons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement (appears in changelog)
- **test**: Adding or correcting tests
- **build**: Build system or dependency changes
- **ci**: CI configuration changes
- **chore**: Other changes not modifying src or test files
- **revert**: Reverting a previous commit

#### Scope Rules

- Set scope to the entry point/folder name of the component or service (e.g., `button`, `tree-view`)
- Use `/` separator for sub-components (e.g., `charts/sankey`)
- For cross-component changes, use common scopes: `angular`, `api`, `a11y`, `ionic`, `i18n`, `theme`, `webcomponents`
- Scope is mandatory for changelog-included types (`feat`, `fix`, `perf`)

#### Subject Rules

- Use imperative, present tense: "change" not "changed" nor "changes"
- Do not capitalize the first letter
- No dot (`.`) at the end
- Write from the user's perspective for `feat`, `fix`, `perf` types

#### Breaking Changes and Deprecations

- Breaking changes must include `BREAKING CHANGE:` in the footer with summary, description, and migration instructions
- Deprecations must include `DEPRECATED:` in the footer with description and recommended update path
- Always use a scope in the header when including breaking change or deprecation notes
- Issue references must be placed before any breaking change or deprecation notes

### Test Coverage

- PRs that introduce functional changes (new features, bug fixes, refactors affecting behavior) must include corresponding unit tests
- New components, services, directives, and pipes must have accompanying test files
- Bug fixes should include a test that reproduces the fixed bug to prevent regressions
- Modified logic paths must be covered by updated or new test cases
- PRs containing only documentation, style, CI, or build changes are exempt from this requirement
