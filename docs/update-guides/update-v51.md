# Update to Element v51

Element v51 requires Angular 22 and changes the visual appearance of every component.
The schematics handle most template and token rewrites. API removals still fail the build.

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

Keep `@ngx-formly/*` on your current version for now, see [Formly](#formly).

## Update Element

```sh
npm i @simpl/brand@4.0.0 # Only for Siemens applications
ng update @siemens/element-ng@51
```

The `migration-v51` schematic covers:

- Typography classes and the `$si-font-size-*`, `$si-line-height-*`, `$si-font-weight-*` variables
- Color, shadow and elevation utility classes, including the `btn-ghost` / `btn-primary-ghost` swap
- `$box-shadow*` and `$element-elevation-*` replaced by `$si-sys-effects-shadow-*`
- Spacer `10` and `11` renamed to `13` and `14`, including the `m*` / `p*` helpers
- `si-split` sizing: `sizes`, `scale` and `collapseDirection`
- `si-list-details` and `si-main-detail-container`: adds `listWidthUnit="fr"` / `mainContainerWidthUnit="fr"` to keep the current layout
- `si-markdown-renderer` replaced by `si-markdown`
- Chat messages: the `contentFormatter` input replaced by projected `si-markdown` content
- `si-icon-status` replaced by `si-status-counter`
- Removed `provideIconConfig()` and the removed inputs `showLessAppsText`, `uploadTextFileSelect` and `tabbable`
- `si-map` `moreText` moved to `si-map-tooltip`
- `--si-feedback-icon-offset` replaced by `--si-feedback-icon-size`

Still using the legacy tabs? Migrate them with:

```sh
ng g @siemens/element-ng:migrate-tabs-legacy
```

### Utility classes the schematic cannot see

The schematic already rewrote static `class` attributes. A template-wide or workspace-wide
replace inverts that work (`text-primary` and `btn-ghost` change meaning a second time).

Two class pairs were repurposed. In stylesheets and in `[ngClass]`, `[class]` and
`[class.*]` values only, apply these renames once, in this order:

Text colors:

1. `text-primary` → `text-accent`
2. `text-body` → `text-primary`

Ghost buttons:

1. `btn-ghost` → `btn-tertiary-ghost`
2. `btn-primary-ghost` → `btn-ghost`

## Apply the remaining changes

Compile your application and work through the errors:

| Area | Change |
| --- | --- |
| Translate | `@siemens/element-ng/translate` no longer re-exports the translate API. Import from `@siemens/element-translate-ng/translate`. |
| Application header | `SiHeaderSiemensLogoComponent` removed. Use the `siHeaderLogo` directive. |
| Sort bar | `SiSortBarComponent` removed without replacement. |
| Datepicker | `calenderWeekLabel` renamed to `calendarWeekLabel`. |
| Filtered search | `datepickerConfig` no longer accepts `enableDateRange` and `enableTwoMonthDateRange`. Remove them. |
| Status bar | `expandButtonText` and `collapseButtonText` replaced by `toggleButtonText`. Translation key: `SI_STATUS_BAR.TOGGLE`. |
| Loading spinner | `LOADING_SPINNER_BLOCKING` and `LOADING_SPINNER_OVERLAY` removed. Use the `isBlockingSpinner` and `isSpinnerOverlay` inputs. |
| Gauge chart | Use `valueFormatter` to format the value. `labelFormatter` now only formats axis labels. |
| Dashboards | `SiWidgetCatalogComponent.closed` now emits an array. |
| Maps | `MapPoint.extraProps` replaced by `extraProperties`. `DEFAULT_FIT_PADDING` removed. |
| Resize observer | `ResizeObserverService._checkAll` removed. Use `mockResizeObserver()` in tests. |
| Theme | `$spacers` values are now CSS variables and need `calc()` in math expressions. |

### Formly

`@siemens/element-ng/formly` now requires ngx-formly v7.1. If you stay on v6, switch your
imports to `@siemens/element-ng/formly-legacy` and keep your current ngx-formly version.
See [dynamic forms](../architecture/dynamic-forms.md).

## Review the UI

Run your application and check every screen. Nothing below fails the build.

**Typography.** Use the [page header](../fundamentals/layouts/header.md). The title is
`h2.si-layout-title`.

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
