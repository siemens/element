# Update to Element v49

## Complete `@simpl/*` to `@siemens/*` migration

Element v49 is no longer released as an internal package under `@simpl/*`.
Finish the migration to `@siemens/*`. See the [migration guide](https://simpl.code.siemens.io/simpl-element/v48-update-guide/#prepare-for-element-v49-recommended) (Siemens Employees only) for instructions.

## Update to Angular 21

Update all `@angular/*` packages to Angular 21.
Follow the [Angular update guide](https://angular.dev/update-guide).

Consider modernizing your application setup by running [Angular migrations](https://angular.dev/reference/migrations).
Review your eslint setup.
Use [Siemens Lint](https://github.com/siemens/lint) and avoid disabling rules to catch deprecated Angular constructs.

## Remove deprecations

Remove all Element deprecated API usages from your codebase.
Use [@typescript-eslint/no-deprecated](https://typescript-eslint.io/rules/no-deprecated/) to find them.

The v49 schematics cover these removals:

- `si-unauthorized-page` / `SiUnauthorizedPageComponent` migrated to `si-info-page` / `SiInfoPageComponent`
- `CONFIG_TOKEN` from dashboards replaced by `SI_DASHBOARD_CONFIGURATION`.
- `ToastStateName` renamed to `StatusType` and relocated to `@siemens/element-ng/common`.
- `SiMapComponent.onResize` removed entirely; references get stripped.

## Update Element

Update the packages and run migrations:

```sh
npm i @simpl/brand@3.1.0 # Only for Siemens applications
ng update @siemens/element-ng@49
```

Do manual adjustments where needed, especially for the following:

### Icons

Element Icons have an updated Design. Review icon usages outside of Element components.

Always use the correct classes for sizing an icon:

- (small: 16px): `<si-icon class="icon-sm" icon="..." />`
- (default: 20px): `<si-icon class="icon" icon="..." />`
- (large: 24px): `<si-icon class="icon-lg" icon="..." />`

As the icons now have a reduced built-in margin, spacings must be adjusted:

- remove negative margins, which previously were needed to remove the spacing overhead
- add extra spacing-1 between icons and inline-text

### Animations

Remove the `@angular/animations` package and `@angular/platform-browser/animations` imports
if your app never uses the `animations` property in their `@Component` metadata.
See our [Motion animation](https://element.siemens.io/architecture/motion-animation/) chapter for more details.

Compile and test your application. Consult the [changelog](https://github.com/siemens/element/releases/tag/v49.0.0) for more changes.

## Manual updating

1. Update all Element packages to version 49.0.0.
2. Update `@simpl/brand` to version 3.1.0.
3. Read the [changelog](https://github.com/siemens/element/releases/tag/v49.0.0) and follow the suggested steps to update your application.
