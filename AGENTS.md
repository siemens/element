You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## Testing

Load the `testing` skill (`.agents/skills/testing/SKILL.md`) when writing, changing,
reviewing, or running tests, and when verifying implementation changes. It covers
test design, assertions, async stabilization, and the repository's test commands.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Documentation

- Document all public symbols (components, directives, services, inputs, outputs, and exported types) with clear TSDoc comments.
- Component documentation pages automatically generate API tables from TSDoc via `[[ api(...) ]]` and `[[ api_types() ]]`.
- Do NOT add prose paragraphs or subsections in `docs/` merely to describe or restate a new component/directive input, output, or public member that is already explained by its TSDoc comment and listed in the generated API table.
- Only add or update prose in `docs/` when there is helpful context beyond the API table — such as non-obvious behavior, interactions across multiple APIs, content projection or composition patterns, UX/usage guidance, or important caveats.
- When a new capability benefits from visual or interactive demonstration, prefer updating an existing example or adding a focused `<si-docs-component>` example over adding redundant explanatory prose.

## Live-Preview Navigation (localhost:4200)

The live-preview demo app runs on `http://localhost:4200/`.
If not online, ask to start the server. Do not run it yourself.

Load examples using this URL schema:

```
http://localhost:4200/#/viewer/preview?e=<relative-example-path>
```

`<relative-example-path>` is resolved against `examplesBaseUrl` (`app/examples/`, see `src/app/app.config.ts:132`) and omits the file extension.

Example for si-form:

```
http://localhost:4200/#/viewer/preview?e=si-form/si-reactive-form
```

### Supported query params (see `projects/live-preview/components/si-example-viewer/si-example-viewer.component.ts`)

Unless specifically requested, only use the example path.

- `e` — example path
- `base` — prefix prepended to each `e`
- `theme` — `light` | `dark`
- `locale` — e.g. `en`, `de`
- `isRTL` — truthy for RTL
- `mode` — device mode for mobile viewport
- `rfs` — root font size in px
- `t` — inline template override
- `framework` — `react` | `vue` | `js`
