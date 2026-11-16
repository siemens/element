---
name: testing
description: Use when writing, changing, reviewing, or running unit, schematics, E2E, accessibility, or visual regression tests, and when verifying implementation changes.
---

# Testing

## Test design and coverage

- Bug fixes and features must have corresponding tests that meaningfully exercise
  the changed behavior and would catch regressions.
- Test observable behavior through public APIs and the rendered DOM, not private
  methods or internal implementation details. Generally, do not test getters and
  setters directly.
- Keep each test focused on a single behavior with clear arrange / act / assert
  phases.
- Cover happy paths, boundary conditions, and regression-prone branches without
  testing every possible combination. For example, if Space and Enter perform the
  same action, verify that both work, but do not repeat every scenario with both
  keys.

## Angular component tests

- Prefer creating the component directly with `TestBed`. Use signal `inputBinding`
  and `outputBinding` bindings instead of test host / wrapper components when
  wiring inputs and outputs.
- Only introduce a test host / wrapper component when testing content projection,
  template composition, or integration behavior that cannot be expressed through
  direct bindings.
- Keep test setup minimal. Mock only the component's direct dependencies and prefer
  lightweight spies or stubs over large testing modules.
- In Vitest browser tests, prefer `page` and `userEvent` for queries and
  interactions.
- Prefer automatic cleanup of mocks and spies with `using` (for example,
  `using spy = vi.spyOn(service, 'save')`) so they are restored when the block
  exits, even if the test fails. See Vitest's
  [auto-cleanup with `using`](https://vitest.dev/guide/recipes/explicit-resources).

## Async test stabilization

- Never use `fixture.detectChanges()` in unit tests. Always use
  `await fixture.whenStable()` to wait for Angular updates, including the initial
  render and updates after interactions or async state changes.

## Assertions

- Prefer assertions on user-observable behavior such as rendered text, attributes,
  ARIA state, CSS classes that are part of the public contract, and emitted outputs.
- Avoid tests that merely check whether a single attribute is set. Instead, use
  the attribute as part of an interaction or a meaningful behavioral assertion.
  For example:

  ```ts
  // Avoid: checking only that the attribute exists.
  expect(element.querySelector('button')).toHaveAttribute('aria-label', 'Save');

  // Prefer: finding the button by its accessible name and using it.
  await userEvent.click(page.getByRole('button', { name: 'Save', exact: true }));
  await expect.element(page.getByRole('status')).toHaveTextContent('Saved');
  ```

- Prefer Vitest's semantic assertion matchers over generic `.toBe()` with manual
  property access — they produce clearer failure messages and more readable tests.
- Use `await expect.element(locator).toBeInTheDocument()` to check DOM presence,
  or `.not.toBeInTheDocument()` to check absence. Use `toBeVisible()` when
  visibility, rather than presence alone, is the requirement.
- Scope browser queries to the component container with
  `page.elementLocator(fixture.nativeElement)` and chain semantic locators from
  it. This keeps queries focused on the component rather than the whole document.
- Use `toHaveLength(n)` instead of accessing `.length` manually:
  `expect(items).toHaveLength(3)`, not `expect(items.length).toBe(3)`.
- Use `toContain(item)` instead of `expect(array.includes(item)).toBe(true)`.
- Use `toMatchObject(subset)` to assert on a subset of properties instead of
  multiple individual `.toBe()` assertions.
- Do not assert on styles in unit tests.
  Exception: they are calculated and dynamic like the position of an Element in response to a drag operation.
- Do not add new unit tests for the change of a static values / style properties.

## E2E tests and visual regression

- Playwright E2E tests are relatively slow. Their primary purpose should be visual
  regression testing through snapshots, not exhaustive functional coverage.
- Ensure that snapshots cover every distinct visual state affected by the change.
  Avoid repeating detailed functional scenarios that belong in unit tests.
- After interactions such as clicking or typing, use an appropriate web-first
  assertion (`await expect(...).to...()`) to verify that the page has reached the
  expected state before taking a snapshot. Otherwise, the snapshot may be flaky.

## Running tests

Infer the correct test command from the file path being edited. After
implementation changes, run the matching unit test command to verify.

### Unit tests

Use the **Vitest** commands below; do not invoke Karma/Jasmine.

Always set `CI=true` when running unit tests. This disables watch mode so tests run
once and configures browser tests to run headlessly.

Choose the most specific matching path prefix:

| File path prefix                  | Command                           |
| --------------------------------- | --------------------------------- |
| `projects/element-ng/schematics/` | `CI=true npm run schematics:test` |
| `projects/element-ng/`            | `CI=true pnpm lib:test`           |
| `projects/charts-ng/`             | `CI=true pnpm charts:test`        |
| `projects/native-charts-ng/`      | `CI=true pnpm native-charts:test` |
| `projects/maps-ng/`               | `CI=true pnpm maps:test`          |
| `projects/dashboards-ng/`         | `CI=true pnpm dashboards:test`    |
| `projects/element-translate-ng/`  | `CI=true pnpm translate:test`     |

The schematics command runs Vitest directly with
`projects/element-ng/vitest.config.schematics.ts`. The other commands use Angular's
test runner with Vitest.

To run a specific test file with the Angular test commands, use `--include`:

```shell
CI=true pnpm lib:test --include='**/component-name/component-name.component.spec.ts'
```

Only the `--include` CLI flag (glob filter) is supported for the Angular test commands.
Do NOT use `--watch`, `--no-watch`, `--watch=false`, `--reporter`, or any other flags.
Use `CI=true` instead of watch flags.

### E2E tests

Use `./e2e-local.sh` to run E2E tests. If you run a specific test, always include
`--project=...` in addition. Never run playwright tests directly.
Do not read `e2e-local.sh`, assume everything is configured properly.

Check whether the required servers are already running before starting any.
The live-preview demo app runs on `http://localhost:4200/`. If it is not online,
ask the user to start it; do not start it yourself. The command for the user is:

```shell
pnpm start -- --allowed-hosts true --host 0.0.0.0
```

Only for dashboards tests, start the corresponding dashboard server if needed:

```shell
pnpm dashboards-demo:build-and-run-all       # webpack, port 4201
pnpm dashboards-demo:build-and-run-all:esm   # ESM, port 4204
```

Run E2E tests:

```shell
./e2e-local.sh                                        # run all
./e2e-local.sh run '--project=element-examples/*'       # examples project
./e2e-local.sh run '--project=dashboards-demo/*'        # dashboards-webpack project
./e2e-local.sh run '--project=dashboards-demo-esm/*'    # dashboards-esm project
./e2e-local.sh vrt                                    # visual regression only
./e2e-local.sh a11y                                   # accessibility only

# Update snapshots
./e2e-local.sh update                                # changed snapshots
./e2e-local.sh update-all                            # all snapshots
./e2e-local.sh update <test-file-name>                 # specific test (glob supported)

# Run specific static tests (with the examples project selected)
./e2e-local.sh run static '--project=element-examples/*' --grep 'buttons/buttons|badges/badges'
```

Always include the project, unless explicitly all snapshots should be updated.
