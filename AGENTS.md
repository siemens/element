You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

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
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## Component Testing

- Test through the component's public API and rendered DOM, not private methods or internal implementation details
- Prefer creating the component directly with `TestBed`. Use signal `inputBinding` and `outputBinding` bindings instead of test host / wrapper components when wiring inputs and outputs
- Only introduce a test host / wrapper component when testing content projection, template composition, or integration behavior that cannot be expressed through direct bindings
- Keep test setup minimal. Mock only the component's direct dependencies and prefer lightweight spies or stubs over large testing modules
- Prefer assertions on user-observable behavior such as rendered text, attributes, ARIA state, CSS classes that are part of the public contract, and emitted outputs
- Prefer `await fixture.whenStable()` after interactions or async state changes instead of repeatedly calling `fixture.detectChanges()`. Use `fixture.detectChanges()` deliberately for the initial render or when the change detection boundary itself is under test
- Keep each test focused on a single behavior with clear arrange / act / assert phases
- Cover happy paths, boundary conditions, and regression-prone branches. Avoid broad snapshot-style assertions that do not explain the intended behavior

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
