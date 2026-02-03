# UI colors

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

| Value light                                                  | Value dark                                                   | Token                 | Use                              | Associated color - light                  | Associated color - dark                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------- | -------------------------------- | ----------------------------------------- | -------------------------------------------- |
| <si-docs-color style="background: #006b80;"></si-docs-color> | <si-docs-color style="background: #00cccc;"></si-docs-color> | `$element-ui-0`       | Logo, selected (active) elements | `$si-ref-color-main-interactive-blue-700` | `$si-ref-color-main-brand-interactive-coral` |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #00ffb9;"></si-docs-color> | `$element-ui-0-hover` | Selected/active (ui-0) + hover   | `$si-ref-color-main-brand-teal`           | `$si-ref-color-main-bold-green-400`          |
| <si-docs-color style="background: #000028;"></si-docs-color> | <si-docs-color style="background: #ffffff;"></si-docs-color> | `$element-ui-1`       | Primary icons                    | `$si-ref-color-main-deep-blue-900`        | `$si-ref-color-main-brand-white`             |
| <si-docs-color style="background: #66667e;"></si-docs-color> | <si-docs-color style="background: #9999a9;"></si-docs-color> | `$element-ui-2`       | Secondary icons                  | `$si-ref-color-main-deep-blue-600`        | `$si-ref-color-main-deep-blue-400`           |
| <si-docs-color style="background: #9999a9;"></si-docs-color> | <si-docs-color style="background: #66667e;"></si-docs-color> | `$element-ui-3`       | Disabled                         | `$si-ref-color-main-deep-blue-400`        | `$si-ref-color-main-deep-blue-600`           |
| <si-docs-color style="background: #e5e5e9;"></si-docs-color> | <si-docs-color style="background: #4c4c68;"></si-docs-color> | `$element-ui-4`       | Borders                          | `$si-ref-color-main-deep-blue-100`        | `$si-ref-color-main-deep-blue-650`           |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #23233c;"></si-docs-color> | `$element-ui-5`       | Inverse                          | `$si-ref-color-main-brand-white`          | `$si-ref-color-main-deep-blue-800`           |
| <si-docs-color style="background: #000000;"></si-docs-color> | <si-docs-color style="background: #000000;"></si-docs-color> | `$element-ui-6`       | Shadows                          | `$si-ref-color-main-brand-black`          | `$si-ref-color-main-brand-black`             |

### Base

Base colors are used as backgrounds of containers.

| Value light                                                    | Value dark                                                     | Token                         | Use                                                       | Associated color - light                       | Associated color - dark                      |
| -------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| <si-docs-color style="background: #f5f5f5;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-base-0`             | Page background                                           | `$si-ref-color-main-sand-200`                  | `$si-ref-color-main-deep-blue-900`           |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #23233c;"></si-docs-color>   | `$element-base-1`             | Header, navigation, card, table, tree, menu background    | `$si-ref-color-main-brand-white`               | `$si-ref-color-main-deep-blue-800`           |
| <si-docs-color style="background: #ededed;"></si-docs-color>   | <si-docs-color style="background: #333353;"></si-docs-color>   | `$element-base-1-hover`       | Hover on base-1 backgrounds, like table, tree, or menu    | `$si-ref-color-main-sand-400`                  | `$si-ref-color-main-deep-blue-750`           |
| <si-docs-color style="background: #e0e0de;"></si-docs-color>   | <si-docs-color style="background: #40405e;"></si-docs-color>   | `$element-base-1-selected`    | Selected on base-1 backgrounds, like table, tree, or menu | `$si-ref-color-main-sand-500`                  | `$si-ref-color-main-deep-blue-700`           |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-base-2`             | Page background with higher contrast pages in dark mode   | `$si-ref-color-main-brand-white`               | `$si-ref-color-main-deep-blue-900`           |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #2d2d45;"></si-docs-color>   | `$element-base-3`             | Background that works on base-0 and base-1 with elevation | `$si-ref-color-main-brand-white`               | `$si-ref-color-main-deep-blue-775`           |
| <si-docs-color style="background: #f0f0ef;"></si-docs-color>   | <si-docs-color style="background: #12122e;"></si-docs-color>   | `$element-base-4`             | Elements placed above base-1, implying a higher elevation | `$si-ref-color-main-sand-300`                  | `$si-ref-color-main-deep-blue-875`           |
| <si-docs-color style="background: #d2e2f7;"></si-docs-color>   | <si-docs-color style="background: #193966;"></si-docs-color>   | `$element-base-information`   | Informational component background for e.g. badges        | `$si-ref-color-main-blue-100`                  | `$si-ref-color-main-blue-900`                |
| <si-docs-color style="background: #c1f2d6;"></si-docs-color>   | <si-docs-color style="background: #12331f;"></si-docs-color>   | `$element-base-success`       | Success component background for e.g. badges              | `$si-ref-color-main-green-100`                 | `$si-ref-color-main-green-900`               |
| <si-docs-color style="background: #fff2ba;"></si-docs-color>   | <si-docs-color style="background: #322501;"></si-docs-color>   | `$element-base-caution`       | Caution component background for e.g. badges              | `$si-ref-color-main-yellow-100`                | `$si-ref-color-main-yellow-900`              |
| <si-docs-color style="background: #fee1cc;"></si-docs-color>   | <si-docs-color style="background: #421a00;"></si-docs-color>   | `$element-base-warning`       | Warning component background for e.g. badges              | `$si-ref-color-main-orange-100`                | `$si-ref-color-main-orange-900`              |
| <si-docs-color style="background: #fcccd7;"></si-docs-color>   | <si-docs-color style="background: #42000c;"></si-docs-color>   | `$element-base-danger`        | Danger component background for e.g. badges               | `$si-ref-color-main-red-100`                   | `$si-ref-color-main-red-900`                 |
| <si-docs-color style="background: #edd6f2;"></si-docs-color>   | <si-docs-color style="background: #a733bc;"></si-docs-color>   | `$element-base-critical`      | Critical component background for e.g. status             | `$si-ref-color-data-orchid-100`                | `$si-ref-color-data-orchid-900`              |
| <si-docs-color style="background: #0000004D;"></si-docs-color> | <si-docs-color style="background: #000000B3;"></si-docs-color> | `$element-base-translucent-1` | Translucent, e.g. backdrop                                | `rgba($si-ref-color-main-brand-black, 0.3)`    | `rgba($si-ref-color-main-brand-black, 0.7)`  |
| <si-docs-color style="background: #000028E2;"></si-docs-color> | <si-docs-color style="background: #FFFFFFE2;"></si-docs-color> | `$element-base-translucent-2` | Slightly translucent background, e.g. toasts              | `rgba($si-ref-color-main-deep-blue-900, 0.88)` | `rgba($si-ref-color-main-brand-white, 0.88)` |

### Actions

Action colors are used to indicate actions that users can perform.

| Value light                                                    | Value dark                                                     | Token                                    | Use                            | Associated color - light                  | Associated color - dark                      |
| -------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- | ------------------------------ | ----------------------------------------- | -------------------------------------------- |
| <si-docs-color style="background: #006b80;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-primary`                | Primary interaction            | `$si-ref-color-main-interactive-blue-700` | `$si-ref-color-main-brand-interactive-coral` |
| <si-docs-color style="background: #005159;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-primary-hover`          | Primary action on hover        | `$si-ref-color-main-brand-teal`           | `$si-ref-color-main-bold-green-400`          |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-action-primary-text`           | Primary text color             | `$si-ref-color-main-brand-white`          | `$si-ref-color-main-deep-blue-900`           |
| <si-docs-color style="background: #FFFFFF00;"></si-docs-color> | <si-docs-color style="background: #FFFFFF00;"></si-docs-color> | `$element-action-secondary`              | Secondary interaction          | `transparent`                             | `transparent`                                |
| <si-docs-color style="background: #d1fff2;"></si-docs-color>   | <si-docs-color style="background: #193966;"></si-docs-color>   | `$element-action-secondary-hover`        | Secondary interaction on hover | `$si-ref-color-main-bold-green-100`       | `$si-ref-color-main-interactive-blue-900`    |
| <si-docs-color style="background: #006b80;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-secondary-text`         | Secondary text color           | `$si-ref-color-main-interactive-blue-700` | `$si-ref-color-main-brand-interactive-coral` |
| <si-docs-color style="background: #196269;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-secondary-text-hover`   | Secondary text hover color     | `$si-ref-color-main-brand-teal-90`        | `$si-ref-color-main-bold-green-400`          |
| <si-docs-color style="background: #006b80;"></si-docs-color>   | <si-docs-color style="background: #00cccc;"></si-docs-color>   | `$element-action-secondary-border`       | Secondary border color         | `$si-ref-color-main-interactive-blue-700` | `$si-ref-color-main-brand-interactive-coral` |
| <si-docs-color style="background: #196269;"></si-docs-color>   | <si-docs-color style="background: #00ffb9;"></si-docs-color>   | `$element-action-secondary-border-hover` | Secondary border hover color   | `$si-ref-color-main-brand-teal-90`        | `$si-ref-color-main-bold-green-400`          |
| <si-docs-color style="background: #a84100;"></si-docs-color>   | <si-docs-color style="background: #ffa525;"></si-docs-color>   | `$element-action-secondary-warning`      | Secondary warning text/border  | `$si-ref-color-main-orange-700`           | `$si-ref-color-main-orange-300`              |
| <si-docs-color style="background: #d72339;"></si-docs-color>   | <si-docs-color style="background: #ff8e9c;"></si-docs-color>   | `$element-action-secondary-danger`       | Secondary danger text/border   | `$si-ref-color-main-red-500`              | `$si-ref-color-main-red-300`                 |
| <si-docs-color style="background: #c75300;"></si-docs-color>   | <si-docs-color style="background: #ff9000;"></si-docs-color>   | `$element-action-warning`                | Warning                        | `$si-ref-color-main-orange-600`           | `$si-ref-color-main-orange-400`              |
| <si-docs-color style="background: #a84100;"></si-docs-color>   | <si-docs-color style="background: #e37200;"></si-docs-color>   | `$element-action-warning-hover`          | Warning action on hover        | `$si-ref-color-main-orange-700`           | `$si-ref-color-main-orange-500`              |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #000028;"></si-docs-color>   | `$element-action-warning-text`           | Warning text color             | `$si-ref-color-main-brand-white`          | `$si-ref-color-main-deep-blue-900`           |
| <si-docs-color style="background: #d72339;"></si-docs-color>   | <si-docs-color style="background: #d72339;"></si-docs-color>   | `$element-action-danger`                 | Danger                         | `$si-ref-color-main-red-500`              | `$si-ref-color-main-red-500`                 |
| <si-docs-color style="background: #bf162e;"></si-docs-color>   | <si-docs-color style="background: #bf162e;"></si-docs-color>   | `$element-action-danger-hover`           | Danger action on hover         | `$si-ref-color-main-red-600`              | `$si-ref-color-main-red-600`                 |
| <si-docs-color style="background: #ffffff;"></si-docs-color>   | <si-docs-color style="background: #ffffff;"></si-docs-color>   | `$element-action-danger-text`            | Danger text color              | `$si-ref-color-main-brand-white`          | `$si-ref-color-main-brand-white`             |
| <si-docs-color style="background: #199fff;"></si-docs-color>   | <si-docs-color style="background: #199fff;"></si-docs-color>   | `$element-focus-default`                 | Default focus shadow color     | `$si-ref-color-main-brand-focus`          | `$si-ref-color-main-brand-focus`             |

### Text

Similarly, categories for typography colors are also defined in this system.

| Value light                                                  | Value dark                                                   | Token                       | Use           | Associated color - light                  | Associated color - dark                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- | ------------- | ----------------------------------------- | -------------------------------------------- |
| <si-docs-color style="background: #000028;"></si-docs-color> | <si-docs-color style="background: #ffffff;"></si-docs-color> | `$element-text-primary`     | Primary       | `$si-ref-color-main-deep-blue-900`        | `$si-ref-color-main-brand-white`             |
| <si-docs-color style="background: #4c4c68;"></si-docs-color> | <si-docs-color style="background: #b3b3be;"></si-docs-color> | `$element-text-secondary`   | Secondary     | `$si-ref-color-main-deep-blue-650`        | `$si-ref-color-main-deep-blue-300`           |
| <si-docs-color style="background: #7d8099;"></si-docs-color> | <si-docs-color style="background: #66667e;"></si-docs-color> | `$element-text-disabled`    | Disabled      | `$si-ref-color-main-deep-blue-500`        | `$si-ref-color-main-deep-blue-600`           |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-text-inverse`     | Inverse       | `$si-ref-color-main-brand-white`          | `$si-ref-color-main-deep-blue-900`           |
| <si-docs-color style="background: #006b80;"></si-docs-color> | <si-docs-color style="background: #00cccc;"></si-docs-color> | `$element-text-active`      | Active        | `$si-ref-color-main-interactive-blue-700` | `$si-ref-color-main-brand-interactive-coral` |
| <si-docs-color style="background: #1e5299;"></si-docs-color> | <si-docs-color style="background: #a9c7f1;"></si-docs-color> | `$element-text-information` | Informational | `$si-ref-color-main-blue-700`             | `$si-ref-color-main-blue-200`                |
| <si-docs-color style="background: #1c703f;"></si-docs-color> | <si-docs-color style="background: #72e6a3;"></si-docs-color> | `$element-text-success`     | Success       | `$si-ref-color-main-green-700`            | `$si-ref-color-main-green-300`               |
| <si-docs-color style="background: #876d00;"></si-docs-color> | <si-docs-color style="background: #ffd732;"></si-docs-color> | `$element-text-caution`     | Caution       | `$si-ref-color-main-yellow-700`           | `$si-ref-color-main-yellow-300`              |
| <si-docs-color style="background: #a84100;"></si-docs-color> | <si-docs-color style="background: #ffa525;"></si-docs-color> | `$element-text-warning`     | Warning       | `$si-ref-color-main-orange-700`           | `$si-ref-color-main-orange-300`              |
| <si-docs-color style="background: #a60823;"></si-docs-color> | <si-docs-color style="background: #ff8e9c;"></si-docs-color> | `$element-text-danger`      | Danger        | `$si-ref-color-main-red-700`              | `$si-ref-color-main-red-300`                 |
| <si-docs-color style="background: #a733bc;"></si-docs-color> | <si-docs-color style="background: #edd6f2;"></si-docs-color> | `$element-text-critical`    | Critical      | `$si-ref-color-data-orchid-500`           | `$si-ref-color-data-orchid-100`              |

### Status

Status colors are used to describe and/or report on the status of different
things.

| Value light                                                  | Value dark                                                   | Token                                  | Use                                           | Associated color - light           | Associated color - dark            |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------- | --------------------------------------------- | ---------------------------------- | ---------------------------------- |
| <si-docs-color style="background: #206ed9;"></si-docs-color> | <si-docs-color style="background: #206ed9;"></si-docs-color> | `$element-status-information`          | Informational                                 | `$si-ref-color-main-blue-500`      | `$si-ref-color-main-blue-500`      |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #ffffff;"></si-docs-color> | `$element-status-information-contrast` | Information contrast for e.g. composite icons | `$si-ref-color-main-brand-white`   | `$si-ref-color-main-brand-white`   |
| <si-docs-color style="background: #1c703f;"></si-docs-color> | <si-docs-color style="background: #28bf66;"></si-docs-color> | `$element-status-success`              | Success                                       | `$si-ref-color-main-green-700`     | `$si-ref-color-main-green-500`     |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-success-contrast`     | Success contrast for e.g. composite icons     | `$si-ref-color-main-brand-white`   | `$si-ref-color-main-deep-blue-900` |
| <si-docs-color style="background: #edbf00;"></si-docs-color> | <si-docs-color style="background: #ffd732;"></si-docs-color> | `$element-status-caution`              | Caution                                       | `$si-ref-color-main-yellow-500`    | `$si-ref-color-main-yellow-300`    |
| <si-docs-color style="background: #000028;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-caution-contrast`     | Caution contrast for e.g. composite icons     | `$si-ref-color-main-deep-blue-900` | `$si-ref-color-main-deep-blue-900` |
| <si-docs-color style="background: #c75300;"></si-docs-color> | <si-docs-color style="background: #ff9000;"></si-docs-color> | `$element-status-warning`              | Warning                                       | `$si-ref-color-main-orange-600`    | `$si-ref-color-main-orange-400`    |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #000028;"></si-docs-color> | `$element-status-warning-contrast`     | Warning contrast for e.g. composite icons     | `$si-ref-color-main-brand-white`   | `$si-ref-color-main-deep-blue-900` |
| <si-docs-color style="background: #d72339;"></si-docs-color> | <si-docs-color style="background: #d72339;"></si-docs-color> | `$element-status-danger`               | Danger                                        | `$si-ref-color-main-red-500`       | `$si-ref-color-main-red-500`       |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #ffffff;"></si-docs-color> | `$element-status-danger-contrast`      | Danger contrast for e.g. composite icons      | `$si-ref-color-main-brand-white`   | `$si-ref-color-main-brand-white`   |
| <si-docs-color style="background: #a733bc;"></si-docs-color> | <si-docs-color style="background: #a733bc;"></si-docs-color> | `$element-status-critical`             | Critical                                      | `$si-ref-color-data-orchid-500`    | `$si-ref-color-data-orchid-500`    |
| <si-docs-color style="background: #ffffff;"></si-docs-color> | <si-docs-color style="background: #ffffff;"></si-docs-color> | `$element-status-critical-contrast`    | Critical contrast for e.g. composite icons    | `$si-ref-color-main-brand-white`   | `$si-ref-color-main-brand-white`   |

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
(_e.g. `$element-ui-0`_) or design system color (_e.g. `$siemens-interactive-blue-500`_). It is
recommended to use semantic colors whenever possible to reduce the impact on
an application if the color system is getting updated. Use design system colors
if a design specification specifically demands it.

### Contextual colors

The contextual colors represent the primary colors of each specific use-case and
are defined by Bootstrap. They can be consumed directly using Bootstraps color
utility classes.

<si-docs-component example="colors/color-utils"></si-docs-component>

Element extends the Bootstrap color utils with additional classes for Element
specific colors. These classes are defined in the
[\_utilities](https://github.com/siemens/element/tree/main/projects/element-theme/src/styles/bootstrap/_utilities.scss) file.

Using contextual colors within SASS stylesheets is also possible by importing
the Element Theme variables.

```scss
@use '@siemens/element-theme/src/styles/variables';

background-color: variables.$element-base-0;
color: variables.$element-text-warning;
...
```
