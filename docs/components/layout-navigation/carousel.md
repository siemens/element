# Carousel

The **carousel** displays a set of slides with navigation controls and
optional auto-play.

## Usage ---

<!-- TODO: Add usage guidelines -->

## Design ---

<!-- TODO: Add design guidelines -->

## Code ---

The `si-carousel` component uses the `siCarouselItem` directive to mark
each slide. Slides are displayed horizontally with snap-scroll behavior.

### Usage

```ts
import { SiCarouselComponent, SiCarouselItemDirective } from '@siemens/element-ng/carousel';

@Component({
  imports: [SiCarouselComponent, SiCarouselItemDirective, ...]
})
```

```html
<si-carousel>
  <div siCarouselItem><h2>Slide 1</h2></div>
  <div siCarouselItem><h2>Slide 2</h2></div>
  <div siCarouselItem><h2>Slide 3</h2></div>
</si-carousel>
```

<si-docs-component example="si-carousel/si-carousel"></si-docs-component>

<si-docs-api component="SiCarouselComponent"></si-docs-api>

<si-docs-types></si-docs-types>
