# Data visualization colors

<!-- markdownlint-disable MD013 MD038 -->

> **Note:** The documented colors are part of the Siemens branding and
> cannot be used for none Siemens applications. The color definitions
> are not part of the OSS package. Element comes with a default theme
> that is not part of the Siemens branding. The default theme is not
> documented.

_Element_ defines additional colors for data visualization that provide design opportunities beyond
the [standard colors](color-palette.md).

!!! warning "Usage of Additional Colors"

    The additional colors shall only be used for data visualization
    (e.g. charts) and not in any other UI context.

    [**Use the standard colors for all other use cases.**](color-palette.md)

Application of the standard color palette together with the additional color palette brings a
unified and consistent experience to our data visualization. The color palettes provide a
predefined set of accessibility tested colors. The usage of color pickers should be prevented as
far as possible. Color pickers might be needed in drawing tools only.

## Tokens ---

Color tokens describe the semantic usage of primitives in a given context. More
specifically, semantic colors act as an intermediary level of specificity,
between the raw value of colors in the color palettes and the usage of those
colors in specific components. There can be various levels of semantic
hierarchies, although we should strive to keep these as simple as possible.

Naming colors semantically has two benefits:

1. It helps designers and developers decide what color to use.
2. It makes our color system more efficient and flexible.

The following color palettes are specific to the context of data visualization:

### Categorical colors

They are used to indicate distinctly different categories. Use these color
palettes for small areas such as lines, dashes, or dots (e.g. trend, line chart).

#### Data

| Value light                                                  | Value dark                                                   | Token              | Associated color - light                   | Associated color - dark                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------ | ------------------------------------------ | ------------------------------------------ |
| <si-docs-color style="background: #009999;"></si-docs-color> | <si-docs-color style="background: #00C1B6;"></si-docs-color> | `$element-data-1`  | `$si-ref-color-data-brand-petrol`          | `$si-ref-color-data-brand-light-petrol`    |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #00FFB9;"></si-docs-color> | `$element-data-2`  | `$si-ref-color-data-turquoise-900`         | `$si-ref-color-data-brand-bold-green`      |
| <si-docs-color style="background: #00890E;"></si-docs-color> | <si-docs-color style="background: #01D65A;"></si-docs-color> | `$element-data-3`  | `$si-ref-color-data-green-700`             | `$si-ref-color-data-green-400`             |
| <si-docs-color style="background: #1A747D;"></si-docs-color> | <si-docs-color style="background: #85E9D2;"></si-docs-color> | `$element-data-4`  | `$si-ref-color-data-turquoise-700`         | `$si-ref-color-data-turquoise-100`         |
| <si-docs-color style="background: #3664C6;"></si-docs-color> | <si-docs-color style="background: #6895F6;"></si-docs-color> | `$element-data-5`  | `$si-ref-color-data-royal-blue-500`        | `$si-ref-color-data-royal-blue-400`        |
| <si-docs-color style="background: #002949;"></si-docs-color> | <si-docs-color style="background: #CCF5F5;"></si-docs-color> | `$element-data-6`  | `$si-ref-color-data-interactive-coral-900` | `$si-ref-color-data-interactive-coral-100` |
| <si-docs-color style="background: #7353E5;"></si-docs-color> | <si-docs-color style="background: #805CFF;"></si-docs-color> | `$element-data-7`  | `$si-ref-color-data-purple-700`            | `$si-ref-color-data-purple-500`            |
| <si-docs-color style="background: #553BA3;"></si-docs-color> | <si-docs-color style="background: #BFB0F3;"></si-docs-color> | `$element-data-8`  | `$si-ref-color-data-purple-900`            | `$si-ref-color-data-purple-200`            |
| <si-docs-color style="background: #740089;"></si-docs-color> | <si-docs-color style="background: #B95CC9;"></si-docs-color> | `$element-data-9`  | `$si-ref-color-data-orchid-700`            | `$si-ref-color-data-orchid-400`            |
| <si-docs-color style="background: #D72339;"></si-docs-color> | <si-docs-color style="background: #FF2640;"></si-docs-color> | `$element-data-10` | `$si-ref-color-data-red-700`               | `$si-ref-color-data-red-500`               |
| <si-docs-color style="background: #4F153D;"></si-docs-color> | <si-docs-color style="background: #E5659B;"></si-docs-color> | `$element-data-11` | `$si-ref-color-data-plum-900`              | `$si-ref-color-data-plum-400`              |
| <si-docs-color style="background: #C04774;"></si-docs-color> | <si-docs-color style="background: #FF98C4;"></si-docs-color> | `$element-data-12` | `$si-ref-color-data-plum-500`              | `$si-ref-color-data-plum-200`              |
| <si-docs-color style="background: #00237A;"></si-docs-color> | <si-docs-color style="background: #97C7FF;"></si-docs-color> | `$element-data-13` | `$si-ref-color-data-royal-blue-700`        | `$si-ref-color-data-royal-blue-200`        |
| <si-docs-color style="background: #801100;"></si-docs-color> | <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-data-14` | `$si-ref-color-data-orange-900`            | `$si-ref-color-data-orange-400`            |
| <si-docs-color style="background: #805800;"></si-docs-color> | <si-docs-color style="background: #FFD732;"></si-docs-color> | `$element-data-15` | `$si-ref-color-data-yellow-900`            | `$si-ref-color-data-yellow-400`            |
| <si-docs-color style="background: #757563;"></si-docs-color> | <si-docs-color style="background: #AAAA96;"></si-docs-color> | `$element-data-16` | `$si-ref-color-data-sand-700`              | `$si-ref-color-data-sand-500`              |
| <si-docs-color style="background: #4C4C68;"></si-docs-color> | <si-docs-color style="background: #7D8099;"></si-docs-color> | `$element-data-17` | `$si-ref-color-data-deep-blue-700`         | `$si-ref-color-data-deep-blue-500`         |

#### Rating Scale

Use it to represent the status of a metric. It shows the quality or properties
of the data in a scale such as poor, average, and good.

| Value                                                        | Token                      | Use       | Associated color                 |
| ------------------------------------------------------------ | -------------------------- | --------- | -------------------------------- |
| <si-docs-color style="background: #D72339;"></si-docs-color> | `$element-color-bad`       | Bad       | `$si-ref-color-main-red-500`     |
| <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-color-poor`      | Poor      | `$si-ref-color-main-orange-500`  |
| <si-docs-color style="background: #EDBF00;"></si-docs-color> | `$element-color-average`   | Average   | `$si-ref-color-main-yellow-500`  |
| <si-docs-color style="background: #9EC625;"></si-docs-color> | `$element-color-good`      | Good      | `$si-ref-color-data-avocado-400` |
| <si-docs-color style="background: #00A327;"></si-docs-color> | `$element-color-excellent` | Excellent | `$si-ref-color-data-green-500`   |

### Sequential colors

#### Data green

| Value light                                                  | Value dark                                                   | Token                   | Associated color - light       | Associated color - dark        |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------- | ------------------------------ | ------------------------------ |
| <si-docs-color style="background: #01D65A;"></si-docs-color> | <si-docs-color style="background: #80EBAC;"></si-docs-color> | `$element-data-green-1` | `$si-ref-color-data-green-400` | `$si-ref-color-data-green-200` |
| <si-docs-color style="background: #00A327;"></si-docs-color> | <si-docs-color style="background: #01D65A;"></si-docs-color> | `$element-data-green-2` | `$si-ref-color-data-green-500` | `$si-ref-color-data-green-400` |
| <si-docs-color style="background: #00890E;"></si-docs-color> | <si-docs-color style="background: #00A327;"></si-docs-color> | `$element-data-green-3` | `$si-ref-color-data-green-700` | `$si-ref-color-data-green-500` |
| <si-docs-color style="background: #005700;"></si-docs-color> | <si-docs-color style="background: #00890E;"></si-docs-color> | `$element-data-green-4` | `$si-ref-color-data-green-900` | `$si-ref-color-data-green-700` |

#### Data turquoise

| Value light                                                  | Value dark                                                   | Token                       | Associated color - light           | Associated color - dark            |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- | ---------------------------------- | ---------------------------------- |
| <si-docs-color style="background: #00D7A0;"></si-docs-color> | <si-docs-color style="background: #47E2BB;"></si-docs-color> | `$element-data-turquoise-1` | `$si-ref-color-data-turquoise-400` | `$si-ref-color-data-turquoise-200` |
| <si-docs-color style="background: #00AF8E;"></si-docs-color> | <si-docs-color style="background: #00D7A0;"></si-docs-color> | `$element-data-turquoise-2` | `$si-ref-color-data-turquoise-500` | `$si-ref-color-data-turquoise-400` |
| <si-docs-color style="background: #1A747D;"></si-docs-color> | <si-docs-color style="background: #00AF8E;"></si-docs-color> | `$element-data-turquoise-3` | `$si-ref-color-data-turquoise-700` | `$si-ref-color-data-turquoise-500` |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #1A747D;"></si-docs-color> | `$element-data-turquoise-4` | `$si-ref-color-data-turquoise-900` | `$si-ref-color-data-turquoise-700` |

#### Data interactive coral

| Value light                                                  | Value dark                                                   | Token                               | Associated color - light                   | Associated color - dark                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------ | ------------------------------------------ |
| <si-docs-color style="background: #00CCCC;"></si-docs-color> | <si-docs-color style="background: #66E0E0;"></si-docs-color> | `$element-data-interactive-coral-1` | `$si-ref-color-data-interactive-coral-400` | `$si-ref-color-data-interactive-coral-200` |
| <si-docs-color style="background: #00BEDC;"></si-docs-color> | <si-docs-color style="background: #00CCCC;"></si-docs-color> | `$element-data-interactive-coral-2` | `$si-ref-color-data-interactive-coral-500` | `$si-ref-color-data-interactive-coral-400` |
| <si-docs-color style="background: #007082;"></si-docs-color> | <si-docs-color style="background: #00A3AB;"></si-docs-color> | `$element-data-interactive-coral-3` | `$si-ref-color-data-interactive-coral-700` | `$si-ref-color-data-interactive-coral-500` |
| <si-docs-color style="background: #002949;"></si-docs-color> | <si-docs-color style="background: #007082;"></si-docs-color> | `$element-data-interactive-coral-4` | `$si-ref-color-data-interactive-coral-900` | `$si-ref-color-data-interactive-coral-700` |

#### Data purple

| Value light                                                  | Value dark                                                   | Token                    | Associated color - light        | Associated color - dark         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------ | ------------------------------- | ------------------------------- |
| <si-docs-color style="background: #A68DFF;"></si-docs-color> | <si-docs-color style="background: #BFB0F3;"></si-docs-color> | `$element-data-purple-1` | `$si-ref-color-data-purple-400` | `$si-ref-color-data-purple-200` |
| <si-docs-color style="background: #805CFF;"></si-docs-color> | <si-docs-color style="background: #A68DFF;"></si-docs-color> | `$element-data-purple-2` | `$si-ref-color-data-purple-500` | `$si-ref-color-data-purple-400` |
| <si-docs-color style="background: #7353E5;"></si-docs-color> | <si-docs-color style="background: #805CFF;"></si-docs-color> | `$element-data-purple-3` | `$si-ref-color-data-purple-700` | `$si-ref-color-data-purple-500` |
| <si-docs-color style="background: #553BA3;"></si-docs-color> | <si-docs-color style="background: #7353E5;"></si-docs-color> | `$element-data-purple-4` | `$si-ref-color-data-purple-900` | `$si-ref-color-data-purple-700` |

#### Data plum

| Value light                                                  | Value dark                                                   | Token                  | Associated color - light      | Associated color - dark       |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------- | ----------------------------- | ----------------------------- |
| <si-docs-color style="background: #E5659B;"></si-docs-color> | <si-docs-color style="background: #FF98C4;"></si-docs-color> | `$element-data-plum-1` | `$si-ref-color-data-plum-400` | `$si-ref-color-data-plum-200` |
| <si-docs-color style="background: #C04774;"></si-docs-color> | <si-docs-color style="background: #E5659B;"></si-docs-color> | `$element-data-plum-2` | `$si-ref-color-data-plum-500` | `$si-ref-color-data-plum-400` |
| <si-docs-color style="background: #9F1853;"></si-docs-color> | <si-docs-color style="background: #C04774;"></si-docs-color> | `$element-data-plum-3` | `$si-ref-color-data-plum-700` | `$si-ref-color-data-plum-500` |
| <si-docs-color style="background: #4F153D;"></si-docs-color> | <si-docs-color style="background: #9F1853;"></si-docs-color> | `$element-data-plum-4` | `$si-ref-color-data-plum-900` | `$si-ref-color-data-plum-700` |

#### Data red

| Value light                                                  | Value dark                                                   | Token                 | Associated color - light     | Associated color - dark      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------- | ---------------------------- | ---------------------------- |
| <si-docs-color style="background: #FF6779;"></si-docs-color> | <si-docs-color style="background: #FFA8B3;"></si-docs-color> | `$element-data-red-1` | `$si-ref-color-data-red-400` | `$si-ref-color-data-red-200` |
| <si-docs-color style="background: #FF2640;"></si-docs-color> | <si-docs-color style="background: #FF6779;"></si-docs-color> | `$element-data-red-2` | `$si-ref-color-data-red-500` | `$si-ref-color-data-red-400` |
| <si-docs-color style="background: #D72339;"></si-docs-color> | <si-docs-color style="background: #FF2640;"></si-docs-color> | `$element-data-red-3` | `$si-ref-color-data-red-700` | `$si-ref-color-data-red-500` |
| <si-docs-color style="background: #990000;"></si-docs-color> | <si-docs-color style="background: #D72339;"></si-docs-color> | `$element-data-red-4` | `$si-ref-color-data-red-900` | `$si-ref-color-data-red-700` |

#### Data orange

| Value light                                                  | Value dark                                                   | Token                    | Associated color - light        | Associated color - dark         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------ | ------------------------------- | ------------------------------- |
| <si-docs-color style="background: #FFBC66;"></si-docs-color> | <si-docs-color style="background: #FFBC66;"></si-docs-color> | `$element-data-orange-1` | `$si-ref-color-data-orange-200` | `$si-ref-color-data-orange-200` |
| <si-docs-color style="background: #FF9000;"></si-docs-color> | <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-data-orange-2` | `$si-ref-color-data-orange-400` | `$si-ref-color-data-orange-400` |
| <si-docs-color style="background: #E57700;"></si-docs-color> | <si-docs-color style="background: #E57700;"></si-docs-color> | `$element-data-orange-3` | `$si-ref-color-data-orange-500` | `$si-ref-color-data-orange-500` |
| <si-docs-color style="background: #BC551E;"></si-docs-color> | <si-docs-color style="background: #BC551E;"></si-docs-color> | `$element-data-orange-4` | `$si-ref-color-data-orange-700` | `$si-ref-color-data-orange-700` |

#### Data sand

| Value light                                                  | Value dark                                                   | Token                  | Associated color - light      | Associated color - dark       |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------- | ----------------------------- | ----------------------------- |
| <si-docs-color style="background: #C5C5B8;"></si-docs-color> | <si-docs-color style="background: #DFDFD9;"></si-docs-color> | `$element-data-sand-1` | `$si-ref-color-data-sand-400` | `$si-ref-color-data-sand-200` |
| <si-docs-color style="background: #AAAA96;"></si-docs-color> | <si-docs-color style="background: #C5C5B8;"></si-docs-color> | `$element-data-sand-2` | `$si-ref-color-data-sand-500` | `$si-ref-color-data-sand-400` |
| <si-docs-color style="background: #757563;"></si-docs-color> | <si-docs-color style="background: #AAAA96;"></si-docs-color> | `$element-data-sand-3` | `$si-ref-color-data-sand-700` | `$si-ref-color-data-sand-500` |
| <si-docs-color style="background: #5E5E4A;"></si-docs-color> | <si-docs-color style="background: #757563;"></si-docs-color> | `$element-data-sand-4` | `$si-ref-color-data-sand-900` | `$si-ref-color-data-sand-700` |

## Color palette ---

_Element_ has the concept of an _additional color palette_, in case the [standard colors](color-palette.md)
don't offer enough variety for use cases where many different colors are used at once.

Only colors from these families (standard and additional) should be used for design and
implementation work of data visualization content.

The palette represents the universe of color possibilities in our interfaces.
Color definitions (primitives) presented below are the hexadecimal values that
we assign to a predefined set of colors. These primitives will be exclusively
used as values for color tokens.

### Brand

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-brand"

### Deep-blue

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-deep-blue"

### Turquoise

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-turquoise"

### Sand

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-sand"

### Royal-blue

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-royal-blue"

### Blue

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-blue"

### Interactive-coral

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-interactive-coral"

### Plum

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-plum"

### Purple

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-purple"

### Orchid

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-orchid"

### Orange

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-orange"

### Yellow

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-yellow"

### Red

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-red"

### Green

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-green"

### Avocado

--8<-- "docs/fundamentals/colors/si-ref.md:si-ref-color-data-avocado"

<style>
si-docs-color {
  display: block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}
</style>
