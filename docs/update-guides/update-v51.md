# Update to Element v51

Element v51 runs on Angular 22 and brings in the system tokens of the Siemens Design Language.
Your components mostly keep their look. Typography is the change you will notice. The legacy
utilities and Sass variables are deprecated, not removed, so they keep working. Only
`text-primary` and `btn-ghost` changed their meaning.

The update schematic does most of the work. This guide covers the rest.

## Before you start

1. Update to the latest Element v49 release.
   Coming from v48 or older? Follow the [v49 update guide](https://element.siemens.io/v49/update-guides/update-v49/) first.
2. Commit or stash your work. The update rewrites templates, styles and TypeScript across your project.
3. Remove all deprecated Element APIs. Use [@typescript-eslint/no-deprecated](https://typescript-eslint.io/rules/no-deprecated/) to find them.

## Update Angular and peer dependencies

Update to Angular 22, following the [Angular update guide](https://angular.dev/update-guide?v=21.0-22.0).

Then align the remaining peer dependencies:

| Package | Version | Note |
| --- | --- | --- |
| `@angular/aria` | `22` | New required peer dependency |
| `@ngx-translate/core` | `18` | v16 is no longer supported |
| `@siemens/ngx-datatable` | `26` or `27` | See [their changelog](https://github.com/siemens/ngx-datatable/blob/main/CHANGELOG.md) |
| `gridstack` | `13` | Only with `@siemens/dashboards-ng` |
| `@siemens/map-styles` | matching Element version | New required peer dependency of `@siemens/maps-ng` |
| `@ngx-formly/*` | `6` or `7.1` | Both are supported, see below |

Using Formly? `@siemens/element-ng/formly` is now based on ngx-formly v7.1. To stay on v6, keep
`@ngx-formly/*` at 6 and import `SiFormlyModule` from `@siemens/element-ng/formly-legacy`. To
move to v7.1, use the standalone `SiFormlyComponent` from `@siemens/element-ng/formly`. See
[dynamic forms](../architecture/dynamic-forms.md).

## Update Element

```sh
npm i @simpl/brand@4.0.0 # Only for Siemens applications
ng update @siemens/element-ng@51
```

This runs the `migration-v51` schematic over your project. It applies all of the following
changes, so you do not have to:

- Renames the typography classes and the `$si-font-size-*`, `$si-line-height-*` and `$si-font-weight-*` variables to the new scale
- Renames the `bg-*` and `text-*` utilities to their system token equivalents, including `text-primary` to `text-accent` and `text-body` to `text-primary`
- Renames `btn-ghost` to `btn-tertiary-ghost` and `btn-primary-ghost` to `btn-ghost`
- Renames `.shadow*`, `.elevation-*`, `$box-shadow*` and `$element-elevation-*` to the new shadow scale
- Renames the spacers `10` and `11` to `13` and `14`, including their `m*` and `p*` helpers
- Renames `--si-feedback-icon-offset` to `--si-feedback-icon-size`
- Renames `si-markdown-renderer` to `si-markdown` and `si-icon-status` to `si-status-counter`
- Moves the `moreText` input of `si-map` into `si-map-tooltip`
- Replaces `scale`, `[sizes]`, `collapseDirection` and `showCollapseButton` on `si-split` with `size`, `unit` and `collapsible`
- Replaces the `contentFormatter` input of chat messages with projected `si-markdown` content
- Adds `listWidthUnit="fr"` to resizable `si-list-details`, and `mainContainerWidthUnit="fr"` to resizable `si-main-detail-container`, so your layout stays as it is
- Adds `btn btn-ghost` to every `si-select` without a `form-control`, so it keeps its appearance
- Adds Element's missing translation handler to `TranslateModule.forRoot()` and `provideTranslateService()`
- Removes `provideIconConfig()` and the deleted inputs `showLessAppsText`, `uploadTextFileSelect` and `tabbable` from your code (`uploadTextFileSelect` needs a follow-up, see below)

Watch the output of the run. For a few `si-split` parts the schematic cannot infer a pixel size
and logs the files where you need to set `size` and `unit` yourself.

Still using the legacy tabs? Migrate them with:

```sh
ng g @siemens/element-ng:migrate-tabs-legacy
```

### Class names the schematic cannot see

The schematic rewrites class names only in the static `class` attribute of your templates — not
in stylesheets, in `[ngClass]`, `[class]` and `[class.*]` bindings, or in strings you build in
TypeScript. CSS custom properties and Sass variables in your stylesheets are already rewritten.

Rename the leftover class names yourself, using the same mappings the schematic applied to your
templates. Most of them are a plain one-to-one replacement. Two pairs swapped their meaning, so
apply those in this order:

1. `text-primary` → `text-accent`, then `text-body` → `text-primary`
2. `btn-ghost` → `btn-tertiary-ghost`, then `btn-primary-ghost` → `btn-ghost`

Limit the search to the places listed above. A project wide find and replace would also hit the
templates the schematic already migrated and rename them a second time.

## Changes you apply yourself

The schematic does not cover the changes below. They show up as build errors, except File
uploader and Gauge chart:

| Area | Change |
| --- | --- |
| Translate | `@siemens/element-ng/translate` no longer re-exports the translate API. Import from `@siemens/element-translate-ng/translate`. |
| Application header | `SiHeaderSiemensLogoComponent` removed. Use the `siHeaderLogo` directive. |
| Sort bar | `SiSortBarComponent` removed without replacement. |
| Datepicker | `calenderWeekLabel` renamed to `calendarWeekLabel`. |
| File uploader | The schematic removed `uploadTextFileSelect`. Move its text into `uploadDropText`, which now renders the whole button label. |
| Filtered search | `datepickerConfig` no longer accepts `enableDateRange` and `enableTwoMonthDateRange`. Remove them. |
| Status bar | `expandButtonText` and `collapseButtonText` replaced by `toggleButtonText`. Translation key: `SI_STATUS_BAR.TOGGLE`. |
| Loading spinner | `LOADING_SPINNER_BLOCKING` and `LOADING_SPINNER_OVERLAY` removed. Use the `isBlockingSpinner` and `isSpinnerOverlay` inputs. |
| Gauge chart | `labelFormatter` now only formats the axis labels. Use `valueFormatter` for the value. |
| Dashboards | `SiWidgetCatalogComponent.closed` now emits an array. |
| Maps | `MapPoint.extraProps` replaced by `extraProperties`. `DEFAULT_FIT_PADDING` removed. |
| Resize observer | `ResizeObserverService._checkAll` removed. Use `mockResizeObserver()` in tests. |
| Theme | `$spacers` values are now CSS variables and need `calc()` in math expressions. |

## Review the UI

Your application builds again. What remains is visual — the compiler will not point you to it:

**Typography.** Headings are now semibold and font sizes follow a new 1.2 step scale. Use the
[page header](../fundamentals/layouts/header.md); the title must be `h2.si-layout-title`.

**Icons.** `si-application-header` and `si-navbar-vertical` now use the default 20px icons.
Overrides of the `.element-*` icon font classes no longer affect Element. Provide custom
icons through the `icons` property of your [theme](../architecture/theming.md).

**Buttons.** `btn-ghost` is now the primary ghost style. The schematic moved your existing
usages to `btn-tertiary-ghost` to keep the current appearance. Review which one you want.

**Chat input.** `actions` are shown inline again. Move actions that belong in the menu to
`secondaryActions`.

**Root font size.** The default is still `16px`. Opt into the browser default now, as
Element v52 will make it the default:

```scss
@use '@siemens/element-theme/src/theme' with (
  $element-root-font-size: initial
);
```

For everything else, see the [changelog](https://github.com/siemens/element/releases/tag/v51.0.0).
