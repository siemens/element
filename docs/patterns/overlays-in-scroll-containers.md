# Overlays in scroll containers

All Element components that open CDK overlays (like typeahead, popovers, ...)
automatically configure the overlays to reposition on scroll.

**Important:** If Element components with overlays are placed within a container that can scroll,
apply the `cdkScrollable` directive to it.
By default, the CDK only listens to scroll events on the document.

## Customizing the scroll strategy

By default, all overlays by Element components will reposition themselves on scroll.
You can change this globally by overriding the default configuration of CDK Overlays
using the [OVERLAY_DEFAULT_CONFIG](https://material.angular.dev/cdk/overlay/api#OVERLAY_DEFAULT_CONFIG)
injection token.

In addition, you can set the input of the respective Element component.

## Available scroll strategies

Read the [related documentation of the CDK](https://material.angular.dev/cdk/overlay/overview#scroll-strategies)
to find a list of available strategies.

## Code ---

Add `cdkScrollable` to the element that actually scrolls. The directive
registers the element with Angular CDK's `ScrollDispatcher`, allowing overlay
scroll strategies to react to its scroll events.

To create a custom strategy,
use either the `Overlay` or the `ScrollStrategyOptions` from the CDK.
Always create a new instance for each overlay.

```ts
import { Overlay, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { inject } from '@angular/core';

class MyComponent {
  // Using the Overlay
  scrollStrategy = inject(Overlay).scrollStrategies.reposition();
  // Using the ScrollStrategyOptions
  scrollStrategy = inject(ScrollStrategyOptions).reposition();
}
```

The following example uses the close strategy for a popover inside a non-root
scrolling container. The typeahead uses the default reposition strategy.

<!-- prettier-ignore -->
<si-docs-component example="overlay-scroll-strategy/overlay-scroll-strategy" height="520"></si-docs-component>
