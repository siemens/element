# Breakpoints

**Breakpoints** are configurable thresholds that define how a layout adapts to different screen sizes.

## Overview

By setting specific widths, breakpoints determine when design adjustments occur, ensuring a consistent
and responsive experience across all viewports.

In CSS, media queries are used to implement breakpoints through conditions such as `min-width`,
which apply styles only when the viewport meets defined criteria.

## Best practices

- Begin with a **mobile-first approach**, defining styles for smaller screens first, as it’s easier to scale up.
- When designing, reference only the relevant breakpoints instead of accounting for every possible size.
- Test across real devices and viewport sizes to validate that breakpoints behave as intended.
- Keep component behavior consistent across breakpoints to preserve familiarity.

## Available breakpoints

These breakpoints align with container widths in multiples of 12 and cover the most common device ranges,
providing a consistent and flexible foundation for responsive design.

| Class infix | Device target | Dimensions | Common use cases |
|-------------|--------------|------------|------------------|
| *None*      | Phones       | <576px     | Base styles for all devices (mobile-first) |
| `sm`        | Large phones, small tablets | ≥576px | Landscape phones, small tablets |
| `md`        | Tablets      | ≥768px     | Tablets, small laptops |
| `lg`        | Small desktops | ≥992px   | Standard desktop monitors |
| `xl`        | Large desktops | ≥1200px  | Large screens, high-res monitors |
| `xxl`       | Extra large screens | ≥1400px | 4K displays, ultra-wide monitors |

