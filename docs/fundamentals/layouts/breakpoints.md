# Breakpoints

Breakpoints are configurable thresholds that define how your layout adapts to different screen sizes and devices. By setting specific widths, you control when and how design changes occur, ensuring a seamless and responsive user experience across a wide range of viewports.

## Concept

- Breakpoints are crucial for building responsive designs. They allow you to tailor layouts and styles according to specific viewport or device sizes.
- In CSS, media queries are the main method for implementing breakpoints. By using conditions such as `min-width`, you can apply styles only when the viewport matches certain criteria.
- A mobile-first approach ensures your layout is optimized for smaller screens by default, then progressively enhances the experience for larger devices. This leads to more efficient CSS, faster rendering, and a consistent user experience across all devices.

## Available breakpoints

Breakpoints determine how responsive layouts adapt to different device or viewport sizes.

| Class infix | Device target | Dimensions | Common use cases |
|-------------|--------------|------------|------------------|
| *None*      | Phones       | <576px     | Base styles for all devices (mobile-first) |
| `sm`        | Large phones, small tablets | ≥576px | Landscape phones, small tablets |
| `md`        | Tablets      | ≥768px     | Tablets, small laptops |
| `lg`        | Small desktops | ≥992px   | Standard desktop monitors |
| `xl`        | Large desktops | ≥1200px  | Large screens, high-res monitors |
| `xxl`       | Extra large screens | ≥1400px | 4K displays, ultra-wide monitors |

These breakpoints are selected to comfortably accommodate containers with widths that are multiples of 12. They represent a subset of common device sizes and viewport dimensions, providing a reliable foundation for responsive design. While not tailored to every device or use case, these ranges offer consistency and flexibility for nearly any project.
