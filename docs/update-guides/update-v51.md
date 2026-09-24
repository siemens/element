# Update to Element v51

??? info "Ehm… what happened with Element v50?"

    <svg aria-hidden="true" fill="currentColor" style="float: right; width: 56px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M357.76,159.19c-.38-52.08-47.21-94.19-101.26-94.19s-101.87,42.11-102.26,94.19c-71.99,9.07-121.24,27.45-121.24,48.66,0,30.2,99.84,54.68,223,54.68s223-24.48,223-54.68c0-21.21-49.25-39.6-121.24-48.66ZM329.73,167.38c-2.37,4.06-8.04,7.01-12.27,8.72l-8.19,3.31c-5.65,2.29-11.4,3.32-17.48,4.75h-.02c-19.85,4.68-52.47,4.52-72.14-.2-5.07-1.22-10.02-2.08-14.82-3.82-8.2-2.98-15.57-6.55-22.47-12.05-.62-11.16.1-23.07,4.91-32.99l3.63-7.48,4.11-6.89c8.57-14.38,25.42-24.78,41.57-29.9,13.35-4.23,26.56-4.23,39.76.2,3.23,1.08,6.61,1.84,9.56,3.42l9.23,4.93c14.64,9.3,26.21,23.78,31.42,40.52l3.01,12.94c.97,4.15.59,9.95.19,14.54Z"/><path d="M183.95,272s54.03,1.5,72.05,1.5,72.05-1.5,72.05-1.5c0,0-24.02,32-72.6,32s-71.5-32-71.5-32Z"/><path d="M176,432c-8.84,0-16-7.16-16-16v-96c0-8.84,7.16-16,16-16s16,7.16,16,16v96c0,8.84-7.16,16-16,16Z"/><path d="M336,432c-8.84,0-16-7.16-16-16v-96c0-8.84,7.16-16,16-16s16,7.16,16,16v96c0,8.84-7.16,16-16,16Z"/><path d="M256,448c-8.84,0-16-7.16-16-16v-96c0-8.84,7.16-16,16-16s16,7.16,16,16v96c0,8.84-7.16,16-16,16Z"/></svg>

    According to our investigation, aliens briefly infiltrated the release pipeline and
    disguised a breaking change as an ordinary, unlabeled update. Before mission control
    detected the extraterrestrial interference, Element 50 had already launched into npm
    orbit far earlier than planned.

    We removed the compromised release, but npm's intergalactic rules are absolute: once a
    version number has been published, it can never be used again. The aliens knew exactly
    what they were doing.

    With Element 50 permanently classified, we secured the pipeline, swept the Figma files
    for crop circles, and moved to the next available designation: Element 51.

    The new release has now left the hangar—properly labeled, thoroughly inspected, and
    mostly free of alien technology. Let us show you what's new.

Element v51 requires Angular v22.
It introduces the system tokens of the Siemens Design Language.
Most Element components keep their appearance. Typography is the main visual change. Legacy
utilities and Sass variables are deprecated, but they still work. Only `text-primary` and
`btn-ghost` changed meaning.

The `migration-v51` schematic applies most of the breaking changes. This guide covers the
remaining steps.

## Before you start

1. Update to the latest Element v49 release.
   If you are updating from v48 or older, follow the [v49 update guide](update-v49.md) first.
2. Update to Angular v22, following the [Angular update guide](https://angular.dev/update-guide?v=21.0-22.0).
   Keep it separate from the Element update, so both changes stay easy to review.
   This is also a good moment to modernize your application setup by running
   [Angular migrations](https://angular.dev/reference/migrations) and to review your eslint setup.
   Use [Siemens Lint](https://github.com/siemens/lint) and avoid disabling rules to catch deprecated
   Angular constructs.
3. Clean up deprecated Element APIs.
   Use [@typescript-eslint/no-deprecated](https://typescript-eslint.io/rules/no-deprecated/) to find them.
   Some of them are migrated for you, see [Changes applied by the schematic](#schematic-changes).
   Not every deprecated API is removed in v51, but the ones that are will turn into compile errors
   after the update. Handling them now keeps that list short.
4. Commit or stash your changes, because the update rewrites templates, styles, and TypeScript
   across your project.

## Update Element

`ng update` bumps all `@siemens/*` Element packages together, but it does not install their peer
dependencies. Take care of those yourself:

| Package                  | Version                  | Note                                                                                   |
| ------------------------ | ------------------------ | -------------------------------------------------------------------------------------- |
| `@angular/aria`          | `22`                     | New required peer dependency                                                           |
| `@siemens/map-styles`    | matching Element version | New required peer dependency of `@siemens/maps-ng`                                     |
| `gridstack`              | `13`                     | Only with `@siemens/dashboards-ng`                                                     |
| `@ngx-formly/*`          | `6` or `7.1`             | Both are supported, see below                                                          |
| `@ngx-translate/core`    | `17` or `18`             | v16 is no longer supported                                                             |
| `@siemens/ngx-datatable` | `26` or `27`             | See [their changelog](https://github.com/siemens/ngx-datatable/blob/main/CHANGELOG.md) |

`@angular/aria`, `@siemens/map-styles` and `gridstack` v13 are new requirements in v51. For the
other three, v51 raises the minimum version. The lower version listed in each row still works, so
move to the newer major only when it suits you.

If you use Formly, `@siemens/element-ng/formly` is now based on ngx-formly v7.1. To stay on v6, keep
`@ngx-formly/*` at v6 and import `SiFormlyModule` from `@siemens/element-ng/formly-legacy`. To
move to v7.1, use the standalone `SiFormlyComponent` from `@siemens/element-ng/formly`. See
[dynamic forms](../architecture/dynamic-forms.md).

Then run the update:

```sh
npm i @simpl/brand@4.0.1 # Only for Siemens applications
ng update @siemens/element-ng@51
```

This command runs the `migration-v51` schematic, and from 51.0.1 also `migration-v51-0-1`.

<a id="schematic-changes"></a>

??? info "Changes applied by the schematic"

    - Renames the typography classes and the `$si-font-size-*`, `$si-line-height-*`, and `$si-font-weight-*` variables to the new scale
    - Renames the `bg-*` and `text-*` utilities to their system token equivalents, including `text-primary` to `text-accent` and `text-body` to `text-primary`
    - Renames `btn-ghost` to `btn-tertiary-ghost` and `btn-primary-ghost` to `btn-ghost`
    - Adds `btn btn-ghost` to every `si-select` without a `form-control`, so it keeps its appearance
    - Renames `$si-sys-*`, `--si-sys-*`, and unprefixed `si-sys-*` color tokens (for example color-picker and chart `colorToken` values) to `$si-sys-color-*`, `--si-sys-color-*`, and `si-sys-color-*`
    - Renames `.shadow*`, `.elevation-*`, `$box-shadow*`, and `$element-elevation-*` to the new shadow scale
    - Renames the spacers `10` and `11` to `13` and `14`, including their `m*` and `p*` helpers
    - Renames `--si-feedback-icon-offset` to `--si-feedback-icon-size`
    - Renames `si-icon-status` to `si-status-counter`
    - Renames `si-markdown-renderer` to `si-markdown`
    - Replaces `SiAiMessageComponent.contentFormatter` and `SiUserMessageComponent.contentFormatter` with projected `si-markdown` content
    - Moves `SiMapComponent.moreText` to `SiMapTooltipComponent.moreText`
    - Replaces `SiSplitComponent.sizes`, `SiSplitPartComponent.scale`, `SiSplitPartComponent.collapseDirection`, and `SiSplitPartComponent.showCollapseButton` with `SiSplitPartComponent.size`, `SiSplitPartComponent.unit`, and `SiSplitPartComponent.collapsible`
    - Sets `SiListDetailsComponent.listWidthUnit` and `SiMainDetailContainerComponent.mainContainerWidthUnit` to `fr` on resizable instances, so the layout stays the same
    - Removes the obsolete inputs `SiLaunchpadFactoryComponent.showLessAppsText`, `SiFileUploaderComponent.uploadTextFileSelect`, `SiFileDropzoneComponent.uploadTextFileSelect`, and `SiSearchBarComponent.tabbable` from your code (`uploadTextFileSelect` needs a follow-up, see below)
    - Adds Element's missing translation handler to `TranslateModule.forRoot()` and `provideTranslateService()`
    - Removes `provideIconConfig()` from your code

If you already updated to Element v51.0.0, install `@simpl/brand@4.0.1` and run `ng update`
again so `migration-v51-0-1` rewrites the color token names. Typography tokens stay as they are.
Utility classes such as `.background-0` are unchanged.

If you import generated brand dist files, update those paths: `si-dark.*` and `si-light.*` become
`si-sys-color.dark.*` and `si-sys-color.light.*`, `si-typography.*` becomes
`si-sys-typography.default.*`, and `si-sys-classes.*` becomes `si-sys-color-classes.*`.

If the schematic cannot infer a pixel size for `si-split`, or if `scale` and `unit` conflict, it
logs the files where you need to set `size` and `unit`.

If you still use the legacy tabs, migrate them with:

```sh
ng g @siemens/element-ng:migrate-tabs-legacy
```

If a tab usage is too complex to migrate automatically, the schematic logs the file so you can
update it by hand.

### Class names the schematic does not rewrite

The schematic rewrites class names only in the static `class` attribute of your templates. It does
not rewrite class names in stylesheets, `[ngClass]`, `[class]`, `[class.*]` bindings, or strings
you build in TypeScript. CSS custom properties and Sass variables in your stylesheets are already
rewritten.

Rename the remaining class names yourself, using the same mappings the schematic applied to your
templates. Most mappings are one-to-one. Two pairs swapped meaning, so apply those in this order:

1. `text-primary` → `text-accent`, then `text-body` → `text-primary`
2. `btn-ghost` → `btn-tertiary-ghost`, then `btn-primary-ghost` → `btn-ghost`

Limit the search to the places listed above, because a project-wide find and replace would also
rename templates the schematic already migrated.

### Fix remaining API changes

Fix these remaining API changes from the compile errors, and check the file uploader and gauge
chart by hand because they do not fail the build:

| Area               | Change                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Application header | `SiHeaderSiemensLogoComponent` removed. Use the `siHeaderLogo` directive.                                                      |
| Dashboards         | `SiWidgetCatalogComponent.closed` now emits an array.                                                                          |
| Datepicker         | `calenderWeekLabel` renamed to `calendarWeekLabel`.                                                                            |
| File uploader      | The schematic removed `uploadTextFileSelect`. Move its text into `uploadDropText`, which now renders the whole button label.   |
| Filtered search    | `datepickerConfig` no longer accepts `enableDateRange` and `enableTwoMonthDateRange`. Remove them.                             |
| Gauge chart        | `labelFormatter` now only formats the axis labels. Use `valueFormatter` for the value.                                         |
| Loading spinner    | `LOADING_SPINNER_BLOCKING` and `LOADING_SPINNER_OVERLAY` removed. Use the `isBlockingSpinner` and `isSpinnerOverlay` inputs.   |
| Maps               | `MapPoint.extraProps` replaced by `extraProperties`. `DEFAULT_FIT_PADDING` removed.                                            |
| Resize observer    | `ResizeObserverService._checkAll` removed. Use `mockResizeObserver()` in tests.                                                |
| Sort bar           | `SiSortBarComponent` removed without replacement.                                                                              |
| Status bar         | `expandButtonText` and `collapseButtonText` replaced by `toggleButtonText`. Translation key: `SI_STATUS_BAR.TOGGLE`.           |
| Theme              | `$spacers` values are now CSS variables and need `calc()` in math expressions.                                                 |
| Translate          | `@siemens/element-ng/translate` no longer re-exports the translate API. Import from `@siemens/element-translate-ng/translate`. |

## Migrate `$element` tokens

Element v51 still ships the `$element-*` design-system tokens, but they are deprecated and will be
removed in an upcoming major version. The Siemens Design Language tokens (`$si-sys-color-*`) replace them
and should be used from now on. There is not always a 1:1 mapping, because the token structure
changed. The mapping files below include rules so the migration can be automated as much as possible.

If your application uses `$element-*` tokens, we recommend migrating them now. The schematic does not
rewrite these usages. Feed the mapping files to an AI assistant together with your stylesheets:

- [color-migration-map.json](color-migration-map.json)
- [typography-migration-map.json](typography-migration-map.json)

Example prompt:

```text
Need to migrate SCSS variables: replace $element-* with the new
design system tokens. Look at color-migration-map.json and
typography-migration-map.json for the mapping between 'old' and
'new'. Note that the JSON uses '.' while the SCSS variables use
'-'. Note that there are rules described in the mapping as well
as the old->new mapping isn't 1:1.
```

Review the result in the running application. Consult UX designers where a mapping depends on
context. Visual regression tests help catch mistakes in this migration.

## Review the UI

The changes below are visual, so check them in the running application:

**Typography:** Headings are now semibold, and font sizes follow a new 1.2 step scale. For page
titles, use the [page header](../fundamentals/layouts/header.md) with `h2.si-layout-title`.

**Icons:** `si-application-header` and `si-navbar-vertical` now use the default 20px icons.
Overrides of the `.element-*` icon font classes no longer apply to Element components. Provide
custom icons through the `icons` property of your [theme](../architecture/theming.md).

**Buttons:** `btn-ghost` is now the primary ghost style. The schematic renamed the usages in your
templates to `btn-tertiary-ghost`, so they keep the previous look. Change a usage to `btn-ghost`
only if you want the new primary ghost style.

**Chat input:** `actions` now render inline, so move items that belong in the menu to
`secondaryActions`.

**Root font size:** The default remains `16px`. To use the browser default, set
`$element-root-font-size` to `initial`, which becomes the default in Element v52:

```scss
@use '@siemens/element-theme/src/theme' with (
  $element-root-font-size: initial
);
```

For everything else, see the [changelog](https://github.com/siemens/element/releases/tag/v51.0.0).
