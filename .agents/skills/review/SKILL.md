---
name: review
description: Use when reviewing pull requests or code changes.
---

# Pull request review

Review changes for correctness, maintainability, and alignment with the pull
request's goal. Apply the following checklist and report actionable findings.

## Review workflow

1. Read the PR description and diff to understand the intended goal.
2. Consult related issues and discussions to understand requirements, constraints,
   and previous decisions. Search for relevant context when it is not linked.
   If that context is unavailable, state the limitation rather than guessing.
3. Inspect the surrounding implementation, tests, examples, and documentation as
   needed to evaluate the changes.
4. Apply the checklist below. Explain each finding's impact and suggest a concrete
   improvement, referencing the relevant file and line where possible. Distinguish
   required changes from optional suggestions.

## CI and local validation

All PRs are checked by the CI pipeline. Do not rerun builds, tests, linting, or
other pipeline checks locally during a review. Inspect the code, tests, and
available CI results instead. Do not claim that checks passed unless their results
are available.

## Scope and implementation

- A PR should have one clear goal and should preferably be small.
- Verify that every change serves that goal.
- Report unrelated changes. Suggest extracting refactorings and similar work into
  separate PRs when they also make sense independently.
- Evaluate alternative approaches to the overall goal, not just individual lines
  of code. Check whether a simpler, more maintainable, or otherwise better solution
  exists, using issues and discussions to inform the assessment.

## Unit tests

- Bug fixes and features must have corresponding tests. Verify that the tests
  meaningfully exercise the changed behavior and would catch regressions.
- Test observable behavior rather than implementation details. Generally, do not
  test getters and setters directly.
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

- In Vitest browser tests, prefer `page` and `userEvent` for queries and
  interactions.
- Prefer automatic cleanup of mocks and spies with `using` (for example,
  `using spy = vi.spyOn(service, 'save')`) so they are restored when the block
  exits, even if the test fails. See Vitest's
  [auto-cleanup with `using`](https://vitest.dev/guide/recipes/explicit-resources).
- Never use `fixture.detectChanges()` in unit tests. Always use
  `await fixture.whenStable()` to wait for Angular updates.
- Do not assert on styles in unit tests, except when testing positioning behavior.
  Visual styling is covered by E2E snapshots.
- Cover meaningful scenarios and boundaries without testing every possible
  combination. For example, if Space and Enter perform the same action, verify
  that both work, but do not repeat every scenario with both keys.

## E2E tests and visual regression

- Playwright E2E tests are relatively slow. Their primary purpose should be visual
  regression testing through snapshots, not exhaustive functional coverage.
- Ensure that snapshots cover every distinct visual state affected by the change.
  Avoid repeating detailed functional scenarios that belong in unit tests.
- After interactions such as clicking or typing, use an appropriate web-first
  assertion (`await expect(...).to...()`) to verify that the page has reached the
  expected state before taking a snapshot. Otherwise, the snapshot may be flaky.

## Documentation and language

- Features must be documented. For small additions, demonstrating them in examples
  may be sufficient.
- All public symbols must have TSDoc comments.
- Check grammar, spelling, clarity, and consistency in user-facing text,
  documentation, comments, and the PR title and description.

## Code comments

- Use comments sparingly. Do not comment on obvious functionality.
- Explain surprising approaches, unusual behavior, and workarounds. Describe why
  they are necessary and, where possible, link to relevant sources, issues, or
  discussions.
