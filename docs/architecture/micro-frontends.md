# Micro-frontends

This chapter describes how to use Element when an application is composed of a
**host** (shell) and **remotes** (micro-frontends) that are loaded at runtime,
e.g. through module/native federation, single-spa or as custom elements.

## Choosing the integration style

| Host | Remote integration |
| --- | --- |
| Element, same major version as the remote | [Light DOM remote](#light-dom-remote) |
| Element, different major version | [Shadow DOM remote](#shadow-dom-remote) |
| No Element (other design system) | [Shadow DOM remote](#shadow-dom-remote) |
| Any, remote delivered as a custom element | [Custom element remote](#custom-element-remote) |

## Light DOM remote

The remote renders into the host document and uses the Element styles and theme
of the host.

> Note: Use this integration only when the host and remote use the same Element
> version. If they use different versions, prefer the Shadow DOM remote setup.

### Host

- Load Element styles globally and apply the theme with `SiThemeService` as in
  any Element application.
- Load the Element libraries as a single shared instance, for example with
  `singleton: true` in the federation configuration.

### Remote

- Do not use Shadow DOM. Keep the default view encapsulation and do not include
  Element styles in `styleUrls`.
- Load the Element libraries with the same shared configuration as the host.

## Shadow DOM remote

The remote bundles its own Element styles into one component with
`ViewEncapsulation.ShadowDom`, the **shadow boundary**. All Element components of the remote render inside this boundary. The host does not need to install any Element package.

### Host

- Do not load Element theme or component styles globally when the host uses a
  different design system.
- Provide the current color scheme ([`ThemeType`](https://github.com/siemens/element/blob/main/projects/element-ng/theme/si-theme.model.ts#L54)) to the remote
  as a plain value through your integration contract (input, attribute, event or
  shared state) and keep it updated on every theme change.

### Remote

- Create a root wrapper component without Shadow DOM that loads the Element icons
  and fonts into the host document and renders the shadow boundary.
  `@font-face` declarations inside a shadow root are ignored by browsers, so
  they must be loaded outside of it.
- Serve the font files from the remote and reference them with absolute URLs.
  The host document resolves relative URLs against its own origin.

  ```json
  // angular.json - assets of the remote
  { "glob": "*.{woff,woff2}", "input": "node_modules/@siemens/element-icons/dist/fonts", "output": "./assets/fonts/" },
  { "glob": "SiemensSansPro*.woff2", "input": "node_modules/@simpl/brand/assets/fonts", "output": "./assets/fonts/" }
  ```

  ```scss
  // remote-fonts.scss
  $font-origin: 'https://remote.example.com/assets/fonts';

  @use '@siemens/element-icons/dist/style/siemens-element-icons' with (
    $font-path: $font-origin
  );

  // Siemens apps only, see "Add Siemens Theme" in getting started
  $siemens-font-path: $font-origin;
  @import '@simpl/brand/assets/fonts/styles/siemens-sans';
  ```

  ```ts
  @Component({
    selector: 'app-remote',
    template: '<app-remote-root [colorScheme]="colorScheme()" />',
    styleUrls: ['./remote-fonts.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [RemoteRootComponent]
  })
  export class RemoteComponent {
    readonly colorScheme = input<ThemeType>('auto');
  }
  ```

- Create the shadow boundary component, typically a layout component around the
  remote's `<router-outlet>`.
- Create a stylesheet for the boundary with `theme-shadow-dom` instead of
  `theme` and reference it only from the boundary's `styleUrls`:

  ```scss
  // remote-styles.scss
  @use '@siemens/element-theme/src/theme-shadow-dom';
  @use '@siemens/element-ng/element-ng';
  ```

#### On the boundary component:

  - set `encapsulation: ViewEncapsulation.ShadowDom`
  - add `SiShadowRootDirective` to `hostDirectives`
  - add `provideShadowRootThemeTarget()` to `providers`
  - add every root-provided service that opens overlays and is used in the
  remote to `providers`, e.g. `SiToastNotificationService`, `SiModalService`
  - inject `SiThemeService` with `{ self: true }` and call `applyThemeType()`
  with the color scheme received from the host

  ```ts
  import { Component, effect, inject, input, ViewEncapsulation } from '@angular/core';
  import {
    provideShadowRootThemeTarget,
    SiShadowRootDirective
  } from '@siemens/element-ng/shadow-root';
  import { SiThemeService, ThemeType } from '@siemens/element-ng/theme';
  import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';

  @Component({
    selector: 'app-remote-root',
    templateUrl: './remote-root.component.html',
    styleUrls: ['./remote-styles.scss', './remote-root.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    hostDirectives: [SiShadowRootDirective],
    providers: [provideShadowRootThemeTarget(), SiToastNotificationService]
  })
  export class RemoteRootComponent {
    readonly colorScheme = input<ThemeType>('auto');
    private themeService = inject(SiThemeService, { self: true });

    constructor() {
      effect(() => this.themeService.applyThemeType(this.colorScheme()));
    }
  }
  ```

Build-time theme options (`$element-theme-default`, `$element-themes`,
`themes.make-theme()`) are configured on `theme-shadow-dom` exactly as described
in [theming](theming.md#build-time-custom-theme).

## Custom element remote

A remote exported with `@angular/elements` should use Shadow DOM unless the host
and remote use the same Element version. In that case, the
[Light DOM remote](#light-dom-remote) setup can be used. For Shadow DOM remotes,
apply the [Shadow DOM remote](#shadow-dom-remote) instructions with these specifics:

### Remote

- Register the root wrapper component (not the shadow boundary) as a custom
  element, so that the icons and fonts are loaded into the host document.

### Host

- Set the color scheme on the element and update it on every theme change.
