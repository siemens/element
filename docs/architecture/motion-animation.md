# Motion and animations

Element uses animations in many places to provide a smoother user experience. However, animations
aren't always a good thing. An important aspect to accessibility is the possibility to reduce
motion and that means the animations. The other place where animations are problematic are
low-end or embedded devices that a lot less CPU/GPU power compared to a desktop PC/laptop or
a modern tablet.

To support accessibility and embedded devices, Element provides a way to reduce/disable
animations:

## Automatically via CSS media query

Animations are automatically configured if the user has set a preference for reduced motion
in the system configuration, i.e. when the CSS media query `@media (prefers-reduced-motion)`
matches.

These settings are done on an operating system level.
More details see [here](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Manually by CSS variable

In cases where the system configuration is not possible, e.g. on embedded devices, it's possible
to disable animations by setting:

```css
:root {
  --element-animations-enabled: 0;
}
```
