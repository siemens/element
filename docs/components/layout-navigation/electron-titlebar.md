# Electron titlebar

This is a titlebar which is used in electron applications. The titlebar will be positioned above the primary navbar and provide forward/backward functionality as well as zoom and custom functions.

## Usage ---

### When to use

The electron-titlebar is mandatory when the application is running in electron
The electron-titlebar should not be used in not electron applications

## Code ---

### Usage

```ts
import { SiElectrontitlebarComponent } from '@siemens/element-ng/electron-titlebar';

@Component({
  imports: [SiElectrontitlebarComponent, ...]
})
```

<si-docs-component base="si-electron-titlebar">
  <si-docs-tab example="si-electron-titlebar" heading="Basic usage"></si-docs-tab>
  <si-docs-tab example="fixed-height-layout-side-panel" heading="Full layout example"></si-docs-tab>
</si-docs-component>

### Correct rendering

The titlebar should be aligned on top of all components.
But when adding the `si-electron-titlebar` to your
application, it will no be aligned above every component
by default. Instead it will be hidden behind an overlapping
component e.g. the `si-navbar-primary`.

In order for correct rendering and padding with the titlebar,
you should add the `in-electron` CSS class to the `body` element.
But this should only happen if the applications runs in `electron`.
For this we also defined a helper function:

```ts
import { runsInElectron } from '@siemens/element-ng';
```

Apply the defined `in-electron` class as follows, in the top level component (usually `app.component.ts`):

```ts
import { runsInElectron } from '@siemens/element-ng';

constructor() {
  if (runsInElectron()) {
    document.documentElement.classList.add('in-electron');
  }
}
```

Following components are affected when using the `si-electron-titlebar`:

- When the `div` with the `class="si-layout-main-padding"` is in use
- [si-application-header](../layout-navigation/application-header.md)
- [si-navbar-vertical](../layout-navigation/vertical-navigation.md)
- [si-side-panel](../layout-navigation/side-panel.md)
- [si-landing-page](../pages/landing-page.md)

### Implement window control overlay with caption buttons

In order to get the `close`, `minimize` and `maximize` buttons from the operating system
in your Electron application, please have a look at the [Electron caption buttons guide](https://www.electronjs.org/de/docs/latest/tutorial/window-customization#window-controls-overlay-macos-windows).

<si-docs-api component="SiElectrontitlebarComponent"></si-docs-api>

<si-docs-types></si-docs-types>
