# Getting started

This chapter helps you set up the development tools and shows you how to add
Element components to a new Angular application.

## Step 1 - Set up the development environment

You need to set up your development environment before you can do anything.

Install [Node.js® and npm](https://nodejs.org/en/about/) if they are not already
on your machine. We recommend using a Node.js version manager to ease switching
between versions. To set this up, see the installation guide for your operating
system:

- [NVM (Linux & Mac)](https://github.com/nvm-sh/nvm#installing-and-updating)
- [NVM for Windows](https://github.com/coreybutler/nvm-windows#installation--upgrades)

To install the latest Node LTS version, run these commands:

```sh
nvm install --lts  # Linux & Mac
nvm install lts    # NVM for Windows
```

!!! info "Supported Node.js versions"

    Element supports **all active LTS versions** of Node.js and therefore
    recommends installing the latest available LTS version. While the newest
    Node.js version _might_ also work, some open-source dependencies could lack
    support for it. For more information, see the
    [Node.js release schedule](https://github.com/nodejs/Release#release-schedule).

Get ready with [Angular](https://angular.dev) and install their CLI:

```sh
npm install -g @angular/cli
```

## Step 2 - Create a new Angular project

Open a terminal window.

Generate a new project and default app by running the following Angular CLI
command:

```sh
ng new app
```

> The Angular version needs to correspond to the peer dependency of the Element
> version. We follow the Angular release cycle and update twice a year. If a new
> Angular version is available but Element has not yet been updated, create an
> Angular app with the correct version using `npx @angular/cli@{version} new {appName}`.
> For example: `npx @angular/cli@20 new my-app`.

Select SCSS as the stylesheet format:

```sh
? Which stylesheet format would you like to use?
  CSS             [ https://developer.mozilla.org/docs/Web/CSS                     ]
❯ Sass (SCSS)     [ https://sass-lang.com/documentation/syntax#scss                ]
  Sass (Indented) [ https://sass-lang.com/documentation/syntax#the-indented-syntax ]
  Less            [ http://lesscss.org                                             ]
```

## Step 3 - Install Element npm packages

- `@siemens/element-ng` provides the components
- `@siemens/element-theme` provides global styles
- `@siemens/element-icons` provides the icons
- `@siemens/element-translate-ng` provides a facade for different translation
  libraries (or none), including `ngx-translate` and `@angular/localize`
- `@angular/cdk` for support from the Angular component development kit

```sh
npm install @siemens/element-ng @siemens/element-theme @siemens/element-translate-ng @siemens/element-icons @angular/cdk
```

> **Note:** The versions of the Angular packages need to correspond to the
> Angular version used in your project.

## Step 4 - Add Element to the project

Stylesheets from npm packages are needed. Add the `node_modules` folder to the
`stylePreprocessorOptions` in the `angular.json` file.

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules/"]
},
```

Include the styles in your application's `styles.scss`:

```scss
// Use Element Theme
@use '@siemens/element-theme/src/theme';

// Use Element components
@use '@siemens/element-ng/element-ng';
```

Add Element components like the `<si-application-header>` to the `app.html` and
update the imports in the `app.ts` accordingly.

```html
<si-application-header>
  <si-header-brand>
    <a siHeaderLogo routerLink="/" class="d-none d-md-flex"></a>
    <h1 class="application-name">My application</h1>
  </si-header-brand>
  <si-header-actions>
    <button
      si-header-account-item
      type="button"
      name="Jane Smith"
      [siHeaderDropdownTriggerFor]="account"
    >
      Account
    </button>
  </si-header-actions>
</si-application-header>

<ng-template #account>
  <si-header-dropdown>
    <div class="mx-5">
      <div class="fw-bold">Jane Smith</div>
      <div>jane.smith.simpl&#64;siemens.com</div>
      <div class="d-flex align-items-center text-secondary mt-2">
        Siemens
        <span class="badge bg-default">Admin</span>
      </div>
    </div>
    <div class="dropdown-divider"></div>
    <button si-header-dropdown-item type="button" [icon]="icons.elementUser">Profile</button>
    <div class="dropdown-divider"></div>
    <button si-header-dropdown-item type="button" [icon]="icons.elementLogout">Logout</button>
  </si-header-dropdown>
</ng-template>
```

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { addIcons } from '@siemens/element-ng/icon';
import { elementLogout, elementUser } from '@siemens/element-icons';

@Component({
  selector: 'app-root',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownItemComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    SiHeaderAccountItemComponent,
    SiHeaderActionsDirective,
    RouterLink
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly icons = addIcons({
    elementUser,
    elementLogout
  });
}
```

## Step 5 - Add Siemens Theme (optional / only for Siemens Apps)

If not already done, configure the Siemens Internal NPM registry.

```
npm config set @simpl:registry=https://code.siemens.com/api/v4/packages/npm/ -g
```

Install the Siemens brand package:

```sh
npm install @simpl/brand
```

Update the `styles.scss` to include the Siemens brand assets:

```scss
@use '@simpl/brand/assets/fonts/styles/siemens-sans';

@use '@simpl/brand/dist/element-theme-siemens-brand-light' as brand-light;
@use '@simpl/brand/dist/element-theme-siemens-brand-dark' as brand-dark;

// This replaces the previous @use '@siemens/element-theme/src/theme' statement and needs to be added after the brand themes.
@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'siemens-brand',
  $element-themes: (
    'siemens-brand',
    'element'
  )
);

// Create the an Element theme based on the Siemens brand tokens.
@use '@siemens/element-theme/src/styles/themes';
@include themes.make-theme(brand-light.$tokens, 'siemens-brand');
@include themes.make-theme(brand-dark.$tokens, 'siemens-brand', true);
```

## Step 6 - Start the application

Now you should be ready to start the application with Element. Go to the project
directory and launch the server.

```sh
npm start
```

The `ng serve` command launches the server, watches your files, and rebuilds the
app as you make changes.

Using the `--open` (or just `-o`) option will automatically open your browser to
`http://localhost:4200/`.
