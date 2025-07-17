# Data visualization colors

<!-- markdownlint-disable MD013 MD038 -->

> **Note:** The documented colors are part of the Siemens branding and
> cannot be used for none Siemens applications. The color definitions
> are not part of the OSS package. Element comes with a default theme
> that is not part of the Siemens branding. The default theme is not
> documented.

*Element* defines additional colors for data visualization that provide design opportunities beyond
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

| Value light                                                  | Value dark                                                   | Token              | Associated color - light              | Associated color - dark               |
|--------------------------------------------------------------|--------------------------------------------------------------|--------------------|---------------------------------------|---------------------------------------|
| <si-docs-color style="background: #009999;"></si-docs-color> | <si-docs-color style="background: #00C1B6;"></si-docs-color> | `$element-data-1`  | `$siemens-data-petrol`                | `$siemens-data-light-petrol`          |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #00FFB9;"></si-docs-color> | `$element-data-2`  | `$siemens-data-turquoise-900`         | `$siemens-data-bold-green`            |
| <si-docs-color style="background: #00890E;"></si-docs-color> | <si-docs-color style="background: #01D65A;"></si-docs-color> | `$element-data-3`  | `$siemens-data-green-700`             | `$siemens-data-green-400`             |
| <si-docs-color style="background: #1A747D;"></si-docs-color> | <si-docs-color style="background: #85E9D2;"></si-docs-color> | `$element-data-4`  | `$siemens-data-turquoise-700`         | `$siemens-data-turquoise-100`         |
| <si-docs-color style="background: #3664C6;"></si-docs-color> | <si-docs-color style="background: #6895F6;"></si-docs-color> | `$element-data-5`  | `$siemens-data-royal-blue-500`        | `$siemens-data-royal-blue-400`        |
| <si-docs-color style="background: #002949;"></si-docs-color> | <si-docs-color style="background: #CCF5F5;"></si-docs-color> | `$element-data-6`  | `$siemens-data-interactive-coral-900` | `$siemens-data-interactive-coral-100` |
| <si-docs-color style="background: #7353E5;"></si-docs-color> | <si-docs-color style="background: #805CFF;"></si-docs-color> | `$element-data-7`  | `$siemens-data-purple-700`            | `$siemens-data-purple-500`            |
| <si-docs-color style="background: #553BA3;"></si-docs-color> | <si-docs-color style="background: #BFB0F3;"></si-docs-color> | `$element-data-8`  | `$siemens-data-purple-900`            | `$siemens-data-purple-200`            |
| <si-docs-color style="background: #740089;"></si-docs-color> | <si-docs-color style="background: #B95CC9;"></si-docs-color> | `$element-data-9`  | `$siemens-data-orchid-700`            | `$siemens-data-orchid-400`            |
| <si-docs-color style="background: #D72339;"></si-docs-color> | <si-docs-color style="background: #FF2640;"></si-docs-color> | `$element-data-10` | `$siemens-data-red-700`               | `$siemens-data-red-500`               |
| <si-docs-color style="background: #4F153D;"></si-docs-color> | <si-docs-color style="background: #E5659B;"></si-docs-color> | `$element-data-11` | `$siemens-data-plum-900`              | `$siemens-data-plum-400`              |
| <si-docs-color style="background: #C04774;"></si-docs-color> | <si-docs-color style="background: #FF98C4;"></si-docs-color> | `$element-data-12` | `$siemens-data-plum-500`              | `$siemens-data-plum-200`              |
| <si-docs-color style="background: #00237A;"></si-docs-color> | <si-docs-color style="background: #97C7FF;"></si-docs-color> | `$element-data-13` | `$siemens-data-royal-blue-700`        | `$siemens-data-royal-blue-200`        |
| <si-docs-color style="background: #801100;"></si-docs-color> | <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-data-14` | `$siemens-data-orange-900`            | `$siemens-data-orange-400`            |
| <si-docs-color style="background: #805800;"></si-docs-color> | <si-docs-color style="background: #FFD732;"></si-docs-color> | `$element-data-15` | `$siemens-data-yellow-900`            | `$siemens-data-yellow-400`            |
| <si-docs-color style="background: #757563;"></si-docs-color> | <si-docs-color style="background: #AAAA96;"></si-docs-color> | `$element-data-16` | `$siemens-data-sand-700`              | `$siemens-data-sand-500`              |
| <si-docs-color style="background: #4C4C68;"></si-docs-color> | <si-docs-color style="background: #7D8099;"></si-docs-color> | `$element-data-17` | `$siemens-data-deep-blue-700`         | `$siemens-data-deep-blue-500`         |

#### Rating Scale

Use it to represent the status of a metric. It shows the quality or properties
of the data in a scale such as poor, average, and good.

| Value                                                        | Token                      | Use       | Associated color            |
|--------------------------------------------------------------|----------------------------|-----------|-----------------------------|
| <si-docs-color style="background: #D72339;"></si-docs-color> | `$element-color-bad`       | Bad       | `$siemens-red-500`          |
| <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-color-poor`      | Poor      | `$siemens-orange-500`       |
| <si-docs-color style="background: #EDBF00;"></si-docs-color> | `$element-color-average`   | Average   | `$siemens-yellow-500`       |
| <si-docs-color style="background: #9EC625;"></si-docs-color> | `$element-color-good`      | Good      | `$siemens-data-avocado-400` |
| <si-docs-color style="background: #00A327;"></si-docs-color> | `$element-color-excellent` | Excellent | `$siemens-data-green-500`   |

### Sequential colors

#### Data green

| Value light                                                  | Value dark                                                   | Token                   | Associated color - light  | Associated color - dark   |
|--------------------------------------------------------------|--------------------------------------------------------------|-------------------------|---------------------------|---------------------------|
| <si-docs-color style="background: #01D65A;"></si-docs-color> | <si-docs-color style="background: #80EBAC;"></si-docs-color> | `$element-data-green-1` | `$siemens-data-green-400` | `$siemens-data-green-200` |
| <si-docs-color style="background: #00A327;"></si-docs-color> | <si-docs-color style="background: #01D65A;"></si-docs-color> | `$element-data-green-2` | `$siemens-data-green-500` | `$siemens-data-green-400` |
| <si-docs-color style="background: #00890E;"></si-docs-color> | <si-docs-color style="background: #00A327;"></si-docs-color> | `$element-data-green-3` | `$siemens-data-green-700` | `$siemens-data-green-500` |
| <si-docs-color style="background: #005700;"></si-docs-color> | <si-docs-color style="background: #00890E;"></si-docs-color> | `$element-data-green-4` | `$siemens-data-green-900` | `$siemens-data-green-700` |

#### Data turquoise

| Value light                                                  | Value dark                                                   | Token                       | Associated color - light      | Associated color - dark       |
|--------------------------------------------------------------|--------------------------------------------------------------|-----------------------------|-------------------------------|-------------------------------|
| <si-docs-color style="background: #00D7A0;"></si-docs-color> | <si-docs-color style="background: #47E2BB;"></si-docs-color> | `$element-data-turquoise-1` | `$siemens-data-turquoise-400` | `$siemens-data-turquoise-200` |
| <si-docs-color style="background: #00AF8E;"></si-docs-color> | <si-docs-color style="background: #00D7A0;"></si-docs-color> | `$element-data-turquoise-2` | `$siemens-data-turquoise-500` | `$siemens-data-turquoise-400` |
| <si-docs-color style="background: #1A747D;"></si-docs-color> | <si-docs-color style="background: #00AF8E;"></si-docs-color> | `$element-data-turquoise-3` | `$siemens-data-turquoise-700` | `$siemens-data-turquoise-500` |
| <si-docs-color style="background: #005159;"></si-docs-color> | <si-docs-color style="background: #1A747D;"></si-docs-color> | `$element-data-turquoise-4` | `$siemens-data-turquoise-900` | `$siemens-data-turquoise-700` |

#### Data interactive coral

| Value light                                                  | Value dark                                                   | Token                               | Associated color - light              | Associated color - dark               |
|--------------------------------------------------------------|--------------------------------------------------------------|-------------------------------------|---------------------------------------|---------------------------------------|
| <si-docs-color style="background: #00CCCC;"></si-docs-color> | <si-docs-color style="background: #66E0E0;"></si-docs-color> | `$element-data-interactive-coral-1` | `$siemens-data-interactive-coral-400` | `$siemens-data-interactive-coral-200` |
| <si-docs-color style="background: #00BEDC;"></si-docs-color> | <si-docs-color style="background: #00CCCC;"></si-docs-color> | `$element-data-interactive-coral-2` | `$siemens-data-interactive-coral-500` | `$siemens-data-interactive-coral-400` |
| <si-docs-color style="background: #007082;"></si-docs-color> | <si-docs-color style="background: #00A3AB;"></si-docs-color> | `$element-data-interactive-coral-3` | `$siemens-data-interactive-coral-700` | `$siemens-data-interactive-coral-500` |
| <si-docs-color style="background: #002949;"></si-docs-color> | <si-docs-color style="background: #007082;"></si-docs-color> | `$element-data-interactive-coral-4` | `$siemens-data-interactive-coral-900` | `$siemens-data-interactive-coral-700` |

#### Data purple

| Value light                                                  | Value dark                                                   | Token                    | Associated color - light   | Associated color - dark    |
|--------------------------------------------------------------|--------------------------------------------------------------|--------------------------|----------------------------|----------------------------|
| <si-docs-color style="background: #A68DFF;"></si-docs-color> | <si-docs-color style="background: #BFB0F3;"></si-docs-color> | `$element-data-purple-1` | `$siemens-data-purple-400` | `$siemens-data-purple-200` |
| <si-docs-color style="background: #805CFF;"></si-docs-color> | <si-docs-color style="background: #A68DFF;"></si-docs-color> | `$element-data-purple-2` | `$siemens-data-purple-500` | `$siemens-data-purple-400` |
| <si-docs-color style="background: #7353E5;"></si-docs-color> | <si-docs-color style="background: #805CFF;"></si-docs-color> | `$element-data-purple-3` | `$siemens-data-purple-700` | `$siemens-data-purple-500` |
| <si-docs-color style="background: #553BA3;"></si-docs-color> | <si-docs-color style="background: #7353E5;"></si-docs-color> | `$element-data-purple-4` | `$siemens-data-purple-900` | `$siemens-data-purple-700` |

#### Data plum

| Value light                                                  | Value dark                                                   | Token                  | Associated color - light | Associated color - dark  |
|--------------------------------------------------------------|--------------------------------------------------------------|------------------------|--------------------------|--------------------------|
| <si-docs-color style="background: #E5659B;"></si-docs-color> | <si-docs-color style="background: #FF98C4;"></si-docs-color> | `$element-data-plum-1` | `$siemens-data-plum-400` | `$siemens-data-plum-200` |
| <si-docs-color style="background: #C04774;"></si-docs-color> | <si-docs-color style="background: #E5659B;"></si-docs-color> | `$element-data-plum-2` | `$siemens-data-plum-500` | `$siemens-data-plum-400` |
| <si-docs-color style="background: #9F1853;"></si-docs-color> | <si-docs-color style="background: #C04774;"></si-docs-color> | `$element-data-plum-3` | `$siemens-data-plum-700` | `$siemens-data-plum-500` |
| <si-docs-color style="background: #4F153D;"></si-docs-color> | <si-docs-color style="background: #9F1853;"></si-docs-color> | `$element-data-plum-4` | `$siemens-data-plum-900` | `$siemens-data-plum-700` |

#### Data red

| Value light                                                  | Value dark                                                   | Token                 | Associated color - light | Associated color - dark  |
|--------------------------------------------------------------|--------------------------------------------------------------|-----------------------|--------------------------|--------------------------|
| <si-docs-color style="background: #FF6779;"></si-docs-color> | <si-docs-color style="background: #FFA8B3;"></si-docs-color> | `$element-data-red-1` | `$siemens-data-red-400`  | `$siemens-data-red-200`  |
| <si-docs-color style="background: #FF2640;"></si-docs-color> | <si-docs-color style="background: #FF6779;"></si-docs-color> | `$element-data-red-2` | `$siemens-data-red-500`  | `$siemens-data-red-400`  |
| <si-docs-color style="background: #D72339;"></si-docs-color> | <si-docs-color style="background: #FF2640;"></si-docs-color> | `$element-data-red-3` | `$siemens-data-red-700`  | `$siemens-data-red-500`  |
| <si-docs-color style="background: #990000;"></si-docs-color> | <si-docs-color style="background: #D72339;"></si-docs-color> | `$element-data-red-4` | `$siemens-data-red-900`  | `$siemens-data-red-700`  |

#### Data orange

| Value light                                                  | Value dark                                                   | Token                    | Associated color - light   | Associated color - dark    |
|--------------------------------------------------------------|--------------------------------------------------------------|--------------------------|----------------------------|----------------------------|
| <si-docs-color style="background: #FFBC66;"></si-docs-color> | <si-docs-color style="background: #FFBC66;"></si-docs-color> | `$element-data-orange-1` | `$siemens-data-orange-200` | `$siemens-data-orange-200` |
| <si-docs-color style="background: #FF9000;"></si-docs-color> | <si-docs-color style="background: #FF9000;"></si-docs-color> | `$element-data-orange-2` | `$siemens-data-orange-400` | `$siemens-data-orange-400` |
| <si-docs-color style="background: #E57700;"></si-docs-color> | <si-docs-color style="background: #E57700;"></si-docs-color> | `$element-data-orange-3` | `$siemens-data-orange-500` | `$siemens-data-orange-500` |
| <si-docs-color style="background: #BC551E;"></si-docs-color> | <si-docs-color style="background: #BC551E;"></si-docs-color> | `$element-data-orange-4` | `$siemens-data-orange-700` | `$siemens-data-orange-700` |

#### Data sand

| Value light                                                  | Value dark                                                   | Token                  | Associated color - light | Associated color - dark  |
|--------------------------------------------------------------|--------------------------------------------------------------|------------------------|--------------------------|--------------------------|
| <si-docs-color style="background: #C5C5B8;"></si-docs-color> | <si-docs-color style="background: #DFDFD9;"></si-docs-color> | `$element-data-sand-1` | `$siemens-data-sand-400` | `$siemens-data-sand-200` |
| <si-docs-color style="background: #AAAA96;"></si-docs-color> | <si-docs-color style="background: #C5C5B8;"></si-docs-color> | `$element-data-sand-2` | `$siemens-data-sand-500` | `$siemens-data-sand-400` |
| <si-docs-color style="background: #757563;"></si-docs-color> | <si-docs-color style="background: #AAAA96;"></si-docs-color> | `$element-data-sand-3` | `$siemens-data-sand-700` | `$siemens-data-sand-500` |
| <si-docs-color style="background: #5E5E4A;"></si-docs-color> | <si-docs-color style="background: #757563;"></si-docs-color> | `$element-data-sand-4` | `$siemens-data-sand-900` | `$siemens-data-sand-700` |

## Color palette ---

*Element* has the concept of an *additional color palette*, in case the [standard colors](color-palette.md)
don't offer enough variety for use cases where many different colors are used at once.

Five additional color families comprise the complete theme.

Only colors from these families (standard and additional) should be used for design and
implementation work of data visualization content.

The palette represents the universe of color possibilities in our interfaces.
Color definitions (primitives) presented below are the hexadecimal values that
we assign to a predefined set of colors. These primitives will be exclusively
used as values for color tokens.

### Brand

| Sample                                                       | Color Variable               | Color Code |
|-------------------------------------------------------------|------------------------------|------------|
| <si-docs-color style="background: #00C1B6;"></si-docs-color> | `$siemens-data-light-petrol` | `#00C1B6`  |
| <si-docs-color style="background: #009999;"></si-docs-color> | `$siemens-data-petrol`       | `#009999`  |
| <si-docs-color style="background: #00FFB9;"></si-docs-color> | `$siemens-data-bold-green`   | `#00FFB9`  |

### Deep blue

| Sample                                                       | Color Variable                | Color Code |
|-------------------------------------------------------------|-------------------------------|------------|
| <si-docs-color style="background: #E5E5E9;"></si-docs-color> | `$siemens-data-deep-blue-100` | `#E5E5E9`  |
| <si-docs-color style="background: #CCCCD4;"></si-docs-color> | `$siemens-data-deep-blue-200` | `#CCCCD4`  |
| <si-docs-color style="background: #9999A9;"></si-docs-color> | `$siemens-data-deep-blue-400` | `#9999A9`  |
| <si-docs-color style="background: #7D8099;"></si-docs-color> | `$siemens-data-deep-blue-500` | `#7D8099`  |
| <si-docs-color style="background: #4C4C68;"></si-docs-color> | `$siemens-data-deep-blue-700` | `#4C4C68`  |
| <si-docs-color style="background: #262648;"></si-docs-color> | `$siemens-data-deep-blue-900` | `#262648`  |

### Turquoise

| Sample                                                       | Color Variable                | Color Code |
|-------------------------------------------------------------|-------------------------------|------------|
| <si-docs-color style="background: #85E9D2;"></si-docs-color> | `$siemens-data-turquoise-100` | `#85E9D2`  |
| <si-docs-color style="background: #47E2BB;"></si-docs-color> | `$siemens-data-turquoise-200` | `#47E2BB`  |
| <si-docs-color style="background: #00D7A0;"></si-docs-color> | `$siemens-data-turquoise-400` | `#00D7A0`  |
| <si-docs-color style="background: #00AF8E;"></si-docs-color> | `$siemens-data-turquoise-500` | `#00AF8E`  |
| <si-docs-color style="background: #1A747D;"></si-docs-color> | `$siemens-data-turquoise-700` | `#1A747D`  |
| <si-docs-color style="background: #005159;"></si-docs-color> | `$siemens-data-turquoise-900` | `#005159`  |

### Sand

| Sample                                                       | Color Variable           | Color Code |
|-------------------------------------------------------------|--------------------------|------------|
| <si-docs-color style="background: #EFEFEC;"></si-docs-color> | `$siemens-data-sand-100` | `#EFEFEC`  |
| <si-docs-color style="background: #DFDFD9;"></si-docs-color> | `$siemens-data-sand-200` | `#DFDFD9`  |
| <si-docs-color style="background: #C5C5B8;"></si-docs-color> | `$siemens-data-sand-400` | `#C5C5B8`  |
| <si-docs-color style="background: #AAAA96;"></si-docs-color> | `$siemens-data-sand-500` | `#AAAA96`  |
| <si-docs-color style="background: #757563;"></si-docs-color> | `$siemens-data-sand-700` | `#757563`  |
| <si-docs-color style="background: #5E5E4A;"></si-docs-color> | `$siemens-data-sand-900` | `#5E5E4A`  |

### Royal blue

| Sample                                                       | Color Variable                 | Color Code |
|-------------------------------------------------------------|--------------------------------|------------|
| <si-docs-color style="background: #B2E0FF;"></si-docs-color> | `$siemens-data-royal-blue-100` | `#B2E0FF`  |
| <si-docs-color style="background: #97C7FF;"></si-docs-color> | `$siemens-data-royal-blue-200` | `#97C7FF`  |
| <si-docs-color style="background: #6895F6;"></si-docs-color> | `$siemens-data-royal-blue-400` | `#6895F6`  |
| <si-docs-color style="background: #3664C6;"></si-docs-color> | `$siemens-data-royal-blue-500` | `#3664C6`  |
| <si-docs-color style="background: #00237A;"></si-docs-color> | `$siemens-data-royal-blue-700` | `#00237A`  |
| <si-docs-color style="background: #00004A;"></si-docs-color> | `$siemens-data-royal-blue-900` | `#00004A`  |

### Blue

| Sample                                                       | Color Variable           | Color Code |
|-------------------------------------------------------------|--------------------------|------------|
| <si-docs-color style="background: #CCF2F8;"></si-docs-color> | `$siemens-data-blue-100` | `#CCF2F8`  |
| <si-docs-color style="background: #80DFED;"></si-docs-color> | `$siemens-data-blue-200` | `#80DFED`  |
| <si-docs-color style="background: #4DD1E7;"></si-docs-color> | `$siemens-data-blue-400` | `#4DD1E7`  |
| <si-docs-color style="background: #00BEDC;"></si-docs-color> | `$siemens-data-blue-500` | `#00BEDC`  |
| <si-docs-color style="background: #0087BE;"></si-docs-color> | `$siemens-data-blue-700` | `#0087BE`  |
| <si-docs-color style="background: #00557C;"></si-docs-color> | `$siemens-data-blue-900` | `#00557C`  |

### Interactive coral

| Sample                                                       | Color Variable                        | Color Code |
|-------------------------------------------------------------|---------------------------------------|------------|
| <si-docs-color style="background: #CCF5F5;"></si-docs-color> | `$siemens-data-interactive-coral-100` | `#CCF5F5`  |
| <si-docs-color style="background: #66E0E0;"></si-docs-color> | `$siemens-data-interactive-coral-200` | `#66E0E0`  |
| <si-docs-color style="background: #00CCCC;"></si-docs-color> | `$siemens-data-interactive-coral-400` | `#00CCCC`  |
| <si-docs-color style="background: #00A3AB;"></si-docs-color> | `$siemens-data-interactive-coral-500` | `#00A3AB`  |
| <si-docs-color style="background: #007082;"></si-docs-color> | `$siemens-data-interactive-coral-700` | `#007082`  |
| <si-docs-color style="background: #002949;"></si-docs-color> | `$siemens-data-interactive-coral-900` | `#002949`  |

### Plum

| Sample                                                       | Color Variable           | Color Code |
|-------------------------------------------------------------|--------------------------|------------|
| <si-docs-color style="background: #FFBEDA;"></si-docs-color> | `$siemens-data-plum-100` | `#FFBEDA`  |
| <si-docs-color style="background: #FF98C4;"></si-docs-color> | `$siemens-data-plum-200` | `#FF98C4`  |
| <si-docs-color style="background: #E5659B;"></si-docs-color> | `$siemens-data-plum-400` | `#E5659B`  |
| <si-docs-color style="background: #C04774;"></si-docs-color> | `$siemens-data-plum-500` | `#C04774`  |
| <si-docs-color style="background: #9F1853;"></si-docs-color> | `$siemens-data-plum-700` | `#9F1853`  |
| <si-docs-color style="background: #4F153D;"></si-docs-color> | `$siemens-data-plum-900` | `#4F153D`  |

### Purple

| Sample                                                       | Color Variable             | Color Code |
|-------------------------------------------------------------|----------------------------|------------|
| <si-docs-color style="background: #D2CBFF;"></si-docs-color> | `$siemens-data-purple-100` | `#D2CBFF`  |
| <si-docs-color style="background: #BFB0F3;"></si-docs-color> | `$siemens-data-purple-200` | `#BFB0F3`  |
| <si-docs-color style="background: #A68DFF;"></si-docs-color> | `$siemens-data-purple-400` | `#A68DFF`  |
| <si-docs-color style="background: #805CFF;"></si-docs-color> | `$siemens-data-purple-500` | `#805CFF`  |
| <si-docs-color style="background: #7353E5;"></si-docs-color> | `$siemens-data-purple-700` | `#7353E5`  |
| <si-docs-color style="background: #553BA3;"></si-docs-color> | `$siemens-data-purple-900` | `#553BA3`  |

### Orchid

| Sample                                                       | Color Variable             | Color Code |
|-------------------------------------------------------------|----------------------------|------------|
| <si-docs-color style="background: #EDD6F2;"></si-docs-color> | `$siemens-data-orchid-100` | `#EDD6F2`  |
| <si-docs-color style="background: #D399DD;"></si-docs-color> | `$siemens-data-orchid-200` | `#D399DD`  |
| <si-docs-color style="background: #B95CC9;"></si-docs-color> | `$siemens-data-orchid-400` | `#B95CC9`  |
| <si-docs-color style="background: #A733BC;"></si-docs-color> | `$siemens-data-orchid-500` | `#A733BC`  |
| <si-docs-color style="background: #740089;"></si-docs-color> | `$siemens-data-orchid-700` | `#740089`  |
| <si-docs-color style="background: #52245C;"></si-docs-color> | `$siemens-data-orchid-900` | `#52245C`  |

### Orange

| Sample                                                       | Color Variable             | Color Code |
|-------------------------------------------------------------|----------------------------|------------|
| <si-docs-color style="background: #FFDEB2;"></si-docs-color> | `$siemens-data-orange-100` | `#FFDEB2`  |
| <si-docs-color style="background: #FFBC66;"></si-docs-color> | `$siemens-data-orange-200` | `#FFBC66`  |
| <si-docs-color style="background: #FF9000;"></si-docs-color> | `$siemens-data-orange-400` | `#FF9000`  |
| <si-docs-color style="background: #E57700;"></si-docs-color> | `$siemens-data-orange-500` | `#E57700`  |
| <si-docs-color style="background: #BE5925;"></si-docs-color> | `$siemens-data-orange-700` | `#BE5925`  |
| <si-docs-color style="background: #801100;"></si-docs-color> | `$siemens-data-orange-900` | `#801100`  |

### Yellow

| Sample                                                       | Color Variable             | Color Code |
|-------------------------------------------------------------|----------------------------|------------|
| <si-docs-color style="background: #FFF7D6;"></si-docs-color> | `$siemens-data-yellow-100` | `#FFF7D6`  |
| <si-docs-color style="background: #FFE784;"></si-docs-color> | `$siemens-data-yellow-200` | `#FFE784`  |
| <si-docs-color style="background: #FFD732;"></si-docs-color> | `$siemens-data-yellow-400` | `#FFD732`  |
| <si-docs-color style="background: #E5BD19;"></si-docs-color> | `$siemens-data-yellow-500` | `#E5BD19`  |
| <si-docs-color style="background: #B28A00;"></si-docs-color> | `$siemens-data-yellow-700` | `#B28A00`  |
| <si-docs-color style="background: #805800;"></si-docs-color> | `$siemens-data-yellow-900` | `#805800`  |

### Red

| Sample                                                       | Color Variable          | Color Code |
|-------------------------------------------------------------|-------------------------|------------|
| <si-docs-color style="background: #FCCCD7;"></si-docs-color> | `$siemens-data-red-100` | `#FCCCD7`  |
| <si-docs-color style="background: #FFA8B3;"></si-docs-color> | `$siemens-data-red-200` | `#FFA8B3`  |
| <si-docs-color style="background: #FF6779;"></si-docs-color> | `$siemens-data-red-400` | `#FF6779`  |
| <si-docs-color style="background: #FF2640;"></si-docs-color> | `$siemens-data-red-500` | `#FF2640`  |
| <si-docs-color style="background: #D72339;"></si-docs-color> | `$siemens-data-red-700` | `#D72339`  |
| <si-docs-color style="background: #990000;"></si-docs-color> | `$siemens-data-red-900` | `#990000`  |

### Green

| Sample                                                       | Color Variable            | Color Code |
|-------------------------------------------------------------|---------------------------|------------|
| <si-docs-color style="background: #CCF7DE;"></si-docs-color> | `$siemens-data-green-100` | `#CCF7DE`  |
| <si-docs-color style="background: #80EBAC;"></si-docs-color> | `$siemens-data-green-200` | `#80EBAC`  |
| <si-docs-color style="background: #01D65A;"></si-docs-color> | `$siemens-data-green-400` | `#01D65A`  |
| <si-docs-color style="background: #00A327;"></si-docs-color> | `$siemens-data-green-500` | `#00A327`  |
| <si-docs-color style="background: #00890E;"></si-docs-color> | `$siemens-data-green-700` | `#00890E`  |
| <si-docs-color style="background: #005700;"></si-docs-color> | `$siemens-data-green-900` | `#005700`  |

### Avocado

| Sample                                                       | Color Variable              | Color Code |
|-------------------------------------------------------------|-----------------------------|------------|
| <si-docs-color style="background: #f3f9e0;"></si-docs-color> | `$siemens-data-avocado-100` | `#F3F9E0`  |
| <si-docs-color style="background: #d1e98a;"></si-docs-color> | `$siemens-data-avocado-200` | `#D1E98A`  |
| <si-docs-color style="background: #9ec625;"></si-docs-color> | `$siemens-data-avocado-400` | `#9EC625`  |
| <si-docs-color style="background: #637d17;"></si-docs-color> | `$siemens-data-avocado-500` | `#637D17`  |
| <si-docs-color style="background: #435410;"></si-docs-color> | `$siemens-data-avocado-700` | `#435410`  |
| <si-docs-color style="background: #2e3a0a;"></si-docs-color> | `$siemens-data-avocado-900` | `#2E3A0A`  |

<style>
si-docs-color {
  display: block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}
</style>
