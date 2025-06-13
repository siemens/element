# UI Colors

<!-- markdownlint-disable MD013 MD046 -->

> **Note:** The documented colors are part of the Siemens branding and
> cannot be used for none Siemens applications. The color definitions
> are not part of the OSS package. Element comes with a default theme
> that is not part of the Siemens branding. The default theme is not
> documented.

Colors are a foundational aspect of any user interface. Maintaining consistent
and engaging UIs requires specific color usage guidelines. To address this
challenge, our system uses a combination of semantic naming and a layer of
abstraction in both our designs and code.

Application of the [color palette](color-palette.md) brings a unified and
consistent experience to our products and interfaces. The theme includes a
variety of solid colors and gradients to ensure that a consistent look is
carried through any application. For example, action, base, and status colors
are all strategically used to communicate different actions and content
throughout the experience.

Element supports two modes: `light` and `dark`. Color variables use the same
semantic naming in both modes.

For a detailed explanation on how dark mode is implemented and how to implement
dark mode for applications and custom components, see [here](../../architecture/theming.md).

## Tokens ---

Color tokens describe the semantic usage of primitives in a given context. More
specifically, semantic colors act as an intermediary level of specificity,
between the raw value of colors in the base palette and the usage of those
colors in specific components. There can be various levels of semantic
hierarchies, although we should strive to keep these as simple as possible.

Naming colors semantically has two benefits:

1. It helps designers and developers decide what color to use.
2. It makes our color system more efficient and flexible.

The following categories are defined in our system:

### UI

UI colors are used on structural properties and icons and provide good contrast
when used over any background.

| Value light                                                  | Value dark                                                   | Token                 | Use                              | Associated color - light        | Associated color - dark      |
|--------------------------------------------------------------|--------------------------------------------------------------|-----------------------|----------------------------------|---------------------------------|------------------------------|
| <si-docs-color style="background: #00718A;"></si-docs-color> | <si-docs-color style="background: #00cccc;"></si-docs-color> | `$element-ui-0`       | Logo, selected (active) elements | `$siemens-interactive-blue-500` | `$siemens-interactive-coral` |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #00ffb9;"></si-docs-color> | `$element-ui-0-hover` | Selected/active (ui-0) + hover   | `$siemens-teal`                 | `$siemens-bold-green`        |
| <si-docs-color style="background: #000028;"></si-docs-color> | <si-docs-color style="background: #FFFFFF;"></si-docs-color> | `$element-ui-1`       | Primary icons                    | `$siemens-deep-blue-900`        | `$siemens-white`             |
| <si-docs-color style="background: #66667e;"></si-docs-color> | <si-docs-color style="background: #9999a9;"></si-docs-color> | `$element-ui-2`       | Secondary icons                  | `$siemens-deep-blue-600`        | `$siemens-deep-blue-400`     |
| <si-docs-color style="background: #9999a9;"></si-docs-color> | <si-docs-color style="background: #66667e;"></si-docs-color> | `$element-ui-3`       | Disabled                         | `$siemens-deep-blue-400`        | `$siemens-deep-blue-600`     |
| <si-docs-color style="background: #e5e5e9;"></si-docs-color> | <si-docs-color style="background: #4c4c68;"></si-docs-color> | `$element-ui-4`       | Borders                          | `$siemens-deep-blue-100`        | `$siemens-deep-blue-700`     |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #23233c;"></si-docs-color> | `$element-ui-5`       | Inverse                          | `$siemens-white`                | `$siemens-deep-blue-800`     |
| <si-docs-color style="background: #000000;"></si-docs-color> | <si-docs-color style="background: #000000;"></si-docs-color> | `$element-ui-6`       | Shadows                          | `$siemens-black`                | `$siemens-black`             |

### Base

Base colors are used as backgrounds of containers.

| Value light                                                    | Value dark                                                     | Token                         | Use                                                       | Associated color - light         | Associated color - dark      |
|----------------------------------------------------------------|----------------------------------------------------------------|-------------------------------|-----------------------------------------------------------|----------------------------------|------------------------------|
| <si-docs-color style="background: #f3f3f0;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-base-0`             | Page background                                           | `$siemens-light-sand`            | `$siemens-deep-blue-900`     |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #23233c;"></si-docs-color>   | `$element-base-1`             | Header, navigation, card, table, tree, menu background    | `$siemens-white`                 | `$siemens-deep-blue-800`     |
| <si-docs-color style="background: #F3F3F0;"></si-docs-color>   | <si-docs-color style="background: #2D2D45;"></si-docs-color>   | `$element-base-1-hover`       | Hover on base-1 backgrounds, like table, tree, or menu    | `$siemens-light-sand`            | `$siemens-dark-grayish-navy` |
| <si-docs-color style="background: #E8E8E3;"></si-docs-color>   | <si-docs-color style="background: #37374D;"></si-docs-color>   | `$element-base-1-selected`    | Selected on base-1 backgrounds, like table, tree, or menu | `$siemens-sand`                  | `$siemens-grayish-navy`      |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-base-2`             | Page background with higher contrast pages in dark mode   | `$siemens-white`                 | `$siemens-deep-blue-900`     |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | <si-docs-color style="background: #37374D;"></si-docs-color>   | `$element-base-3`             | Background that works on base-0 and base-1 with elevation | `$siemens-white`                 | `$siemens-grayish-navy`      |
| <si-docs-color style="background: #D2E2F7;"></si-docs-color>   | <si-docs-color style="background: #193966;"></si-docs-color>   | `$element-base-information`   | Informational component background for e.g. badges        | `$siemens-blue-100`              | `$siemens-blue-900`          |
| <si-docs-color style="background: #C1F2D6;"></si-docs-color>   | <si-docs-color style="background: #12331F;"></si-docs-color>   | `$element-base-success`       | Success component background for e.g. badges              | `$siemens-green-100`             | `$siemens-green-900`         |
| <si-docs-color style="background: #fff2ba;"></si-docs-color>   | <si-docs-color style="background: #4d3901;"></si-docs-color>   | `$element-base-caution`       | Caution component background for e.g. badges              | `$siemens-yellow-100`            | `$siemens-yellow-900`        |
| <si-docs-color style="background: #fee1cc;"></si-docs-color>   | <si-docs-color style="background: #8f3700;"></si-docs-color>   | `$element-base-warning`       | Warning component background for e.g. badges              | `$siemens-orange-100`            | `$siemens-orange-900`        |
| <si-docs-color style="background: #fcccd7;"></si-docs-color>   | <si-docs-color style="background: #650011;"></si-docs-color>   | `$element-base-danger`        | Danger component background for e.g. badges               | `$siemens-red-100`               | `$siemens-red-900`           |
| <si-docs-color style="background: #fcccd7;"></si-docs-color>   | <si-docs-color style="background: #650011;"></si-docs-color>   | `$element-base-critical`      | Critical component background for e.g. status             | `$siemens-red-100`               | `$siemens-red-900`           |
| <si-docs-color style="background: #0000004D;"></si-docs-color> | <si-docs-color style="background: #000000B3;"></si-docs-color> | `$element-base-translucent-1` | Translucent, e.g. backdrop                                | `rgba($siemens-black, 0.3)`      | `rgba($siemens-black, 0.7)`  |
| <si-docs-color style="background: #000028E2;"></si-docs-color> | <si-docs-color style="background: #FFFFFFE2;"></si-docs-color> | `$element-base-translucent-2` | Slightly translucent background, e.g. toasts              | `rgba($siemens-deep-blue, 0.88)` | `rgba($siemens-white, 0.88)` |

### Actions

Action colors are used to indicate actions that users can perform.

| Value light                                                    | Value dark                                                     | Token                                     | Use                            | Associated color - light                   | Associated color - dark                 |
|----------------------------------------------------------------|----------------------------------------------------------------|-------------------------------------------|--------------------------------|--------------------------------------------|-----------------------------------------|
| <si-docs-color style="background: #00718A;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-primary`                 | Primary interaction            | `$siemens-interactive-blue-500`            | `$siemens-interactive-coral`            |
| <si-docs-color style="background: #004545;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-primary-hover`           | Primary action on hover        | `$siemens-teal`                            | `$siemens-bold-green`                   |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-action-primary-text`            | Primary text color             | `$siemens-white`                           | `$siemens-deep-blue-900`                |
| <si-docs-color style="background: #FFFFFF00;"></si-docs-color> | <si-docs-color style="background: #FFFFFF00;"></si-docs-color> | `$element-action-secondary`               | Secondary interaction          | `transparent`                              | `transparent`                           |
| <si-docs-color style="background: #c2ffee;"></si-docs-color>   | <si-docs-color style="background: #001f39;"></si-docs-color>   | `$element-action-secondary-hover`         | Secondary interaction on hover | `$siemens-light-bold-green`                | `$siemens-dark-bold-green`              |
| <si-docs-color style="background: #00718A;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-secondary-text`          | Secondary text color           | `$siemens-interactive-blue-500`            | `$siemens-interactive-coral`            |
| <si-docs-color style="background: #005159;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-secondary-text-hover`    | Secondary text hover color     | `$siemens-teal`                            | `$siemens-bold-green`                   |
| <si-docs-color style="background: #00718A;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-secondary-border`        | Secondary border color         | `$siemens-interactive-blue-500`            | `$siemens-interactive-coral`            |
| <si-docs-color style="background: #005159;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-secondary-border-hover`  | Secondary border hover color   | `$siemens-teal`                            | `$siemens-bold-green`                   |
| <si-docs-color style="background: #8C3A00;"></si-docs-color>   | <si-docs-color style="background: #ff9000;"></si-docs-color>   | `$element-action-secondary-warning`       | Secondary warning text/border  | `$siemens-orange-900`                      | `$siemens-orange-500`                   |
| <si-docs-color style="background: #d72339;"></si-docs-color>   | <si-docs-color style="background: #fe8389;"></si-docs-color>   | `$element-action-secondary-danger`        | Secondary danger text/border   | `$siemens-red-500`                         | `$siemens-red-300`                      |
| <si-docs-color style="background: #c75300"></si-docs-color>    | <si-docs-color style="background: #ff9000;"></si-docs-color>   | `$element-action-warning`                 | Warning                        | `$siemens-orange-700`                      | `$siemens-orange-500`                   |
| <si-docs-color style="background: #8C3A00;"></si-docs-color>   | <si-docs-color style="background: #c75300;"></si-docs-color>   | `$element-action-warning-hover`           | Warning action on hover        | `$siemens-orange-900`                      | `$siemens-orange-700`                   |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-action-warning-text`            | Warning text color             | `$siemens-white`                           | `$siemens-deep-blue-900`                |
| <si-docs-color style="background: #d72339;"></si-docs-color>   | <si-docs-color style="background: #d72339;"></si-docs-color>   | `$element-action-danger`                  | Danger                         | `$siemens-red-500`                         | `$siemens-red-500`                      |
| <si-docs-color style="background: #A60823;"></si-docs-color>   | <si-docs-color style="background: #a60823;"></si-docs-color>   | `$element-action-danger-hover`            | Danger action on hover         | `$siemens-red-700`                         | `$siemens-red-700`                      |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | <si-docs-color style="background: #FFFFFF;"></si-docs-color>   | `$element-action-danger-text`             | Danger text color              | `$siemens-white`                           | `$siemens-white`                        |
| <si-docs-color style="background: #199fff;"></si-docs-color>   | <si-docs-color style="background: #199fff;"></si-docs-color>   | `$element-focus-default`                  | Default focus shadow color     | `$siemens-focus`                           | `$siemens-focus`                        |

### Text

Similarly, categories for typography colors are also defined in this system.

| Value light                                                    | Value dark                                                     | Token                            | Use                 | Associated color - light                   | Associated color - dark                 |
|----------------------------------------------------------------|----------------------------------------------------------------|----------------------------------|---------------------|--------------------------------------------|-----------------------------------------|
| <si-docs-color style="background: #000028;"></si-docs-color>   | <si-docs-color style="background: #ffffff;"></si-docs-color>   | `$element-text-primary`          | Primary             | `$siemens-deep-blue-900`                   | `$siemens-white`                        |
| <si-docs-color style="background: #4c4c68;"></si-docs-color>   | <si-docs-color style="background: #b3b3be;"></si-docs-color>   | `$element-text-secondary`        | Secondary           | `$siemens-deep-blue-700`                   | `$siemens-deep-blue-300`                |
| <si-docs-color style="background: #7d8099;"></si-docs-color>   | <si-docs-color style="background: #66667e;"></si-docs-color>   | `$element-text-disabled`         | Disabled            | `$siemens-deep-blue-500`                   | `$siemens-deep-blue-600`                |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-text-inverse`          | Inverse             | `$siemens-white`                           | `$siemens-deep-blue-900`                |
| <si-docs-color style="background: #00718A;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-text-active`           | Active              | `$siemens-interactive-blue-500`            | `$siemens-interactive-coral`            |
| <si-docs-color style="background: #1e5299;"></si-docs-color>   | <si-docs-color style="background: #d2e2f7;"></si-docs-color>   | `$element-text-information`      | Informational       | `$siemens-blue-700`                        | `$siemens-blue-100`                     |
| <si-docs-color style="background: #1c703f;"></si-docs-color>   | <si-docs-color style="background: #c1f2d6;"></si-docs-color>   | `$element-text-success`          | Success             | `$siemens-green-700`                       | `$siemens-green-100`                    |
| <si-docs-color style="background: #876d00;"></si-docs-color>   | <si-docs-color style="background: #fff2ba;"></si-docs-color>   | `$element-text-caution`          | Caution             | `$siemens-yellow-900`                      | `$siemens-yellow-100`                   |
| <si-docs-color style="background: #c75300;"></si-docs-color>   | <si-docs-color style="background: #fee1cc;"></si-docs-color>   | `$element-text-warning`          | Warning             | `$siemens-orange-900`                      | `$siemens-orange-100`                   |
| <si-docs-color style="background: #a60823;"></si-docs-color>   | <si-docs-color style="background: #fcccd7;"></si-docs-color>   | `$element-text-danger`           | Danger              | `$siemens-red-700`                         | `$siemens-red-100`                      |
| <si-docs-color style="background: #a60823;"></si-docs-color>   | <si-docs-color style="background: #fcccd7;"></si-docs-color>   | `$element-text-critical`         | Critical            | `$siemens-red-700`                         | `$siemens-red-100`                      |

### Status

Status colors are used to describe and/or report on the status of different
things.

| Value light                                                  | Value dark                                                   | Token                                  | Use                                           | Associated color - light | Associated color - dark  |
|--------------------------------------------------------------|--------------------------------------------------------------|----------------------------------------|-----------------------------------------------|--------------------------|--------------------------|
| <si-docs-color style="background: #206ED9;"></si-docs-color> | <si-docs-color style="background: #206ED9;"></si-docs-color> | `$element-status-information`          | Informational                                 | `$siemens-blue-500`      | `$siemens-blue-500`      |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #FFFFFF;"></si-docs-color> | `$element-status-information-contrast` | Information contrast for e.g. composite icons | `$siemens-white`         | `$siemens-white`         |
| <si-docs-color style="background: #1C703F;"></si-docs-color> | <si-docs-color style="background: #28BF66;"></si-docs-color> | `$element-status-success`              | Success                                       | `$siemens-green-700`     | `$siemens-green-500`     |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-success-contrast`     | Success contrast for e.g. composite icons     | `$siemens-white`         | `$siemens-deep-blue-900` |
| <si-docs-color style="background: #edbf00;"></si-docs-color> | <si-docs-color style="background: #ffd732;"></si-docs-color> | `$element-status-caution`              | Caution                                       | `$siemens-yellow-500`    | `$siemens-yellow-300`    |
| <si-docs-color style="background: #000028;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-caution-contrast`     | Caution contrast for e.g. composite icons     | `$siemens-deep-blue-900` | `$siemens-deep-blue-900` |
| <si-docs-color style="background: #c75300;"></si-docs-color> | <si-docs-color style="background: #ff9000;"></si-docs-color> | `$element-status-warning`              | Warning                                       | `$siemens-orange-700`    | `$siemens-orange-500`    |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-warning-contrast`     | Warning contrast for e.g. composite icons     | `$siemens-white`         | `$siemens-deep-blue-900` |
| <si-docs-color style="background: #d72339;"></si-docs-color> | <si-docs-color style="background: #d72339;"></si-docs-color> | `$element-status-danger`               | Danger                                        | `$siemens-red-500`       | `$siemens-red-500`       |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #FFFFFF;"></si-docs-color> | `$element-status-danger-contrast`      | Danger contrast for e.g. composite icons      | `$siemens-white`         | `$siemens-white`         |
| <si-docs-color style="background: #650011;"></si-docs-color> | <si-docs-color style="background: #a60823;"></si-docs-color> | `$element-status-critical`             | Critical                                      | `$siemens-red-900`       | `$siemens-red-700`       |
| <si-docs-color style="background: #FFFFFF;"></si-docs-color> | <si-docs-color style="background: #FFFFFF;"></si-docs-color> | `$element-status-critical-contrast`    | Critical contrast for e.g. composite icons    | `$siemens-white`         | `$siemens-white`         |

<style>
si-docs-color {
  display: block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}
</style>

## Code ---

Colors can be consumed within applications either by semantic color
(*e.g. `$element-ui-0`*) or design system color (*e.g. `$siemens-interactive-blue-500`*). It is
recommended to use semantic colors whenever possible to reduce the impact on
an application if the color system is getting updated. Use design system colors
if a design specification specifically demands it.

### Contextual Colors

The contextual colors represent the primary colors of each specific use-case and
are defined by Bootstrap. They can be consumed directly using Bootstraps color
utility classes.

<si-docs-component example="colors/color-utils"></si-docs-component>

Element extends the Bootstrap color utils with additional classes for Element
specific colors. These classes are defined in the
[_utilities](https://github.com/siemens/element/tree/main/projects/element-theme/src/styles/bootstrap/_utilities.scss) file.

Using contextual colors within SASS stylesheets is also possible by importing
the Element Theme variables.

```scss
@use '@siemens/element-theme/src/styles/variables';

background-color: variables.$element-base-0;
color: variables.$element-text-warning;
...
```
