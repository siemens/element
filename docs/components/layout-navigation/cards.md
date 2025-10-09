# Cards

A card is a content container to display important and useful information, e.g. trend charts, key data etc.

## Usage ---

![Card](images/card.png)

### When to use

- To cluster information.

### Best practices

- Only include the most relevant information.
- Set an appropriate size (height and width) of the card to give the content the space needed to convey the information.

## Design ---

### Elements

Every card contains the following elements:

1. Title: The title may either be static, dynamically adapted based on the content or user defined.
By dragging the title bar, a user can move the card to another position.
2. Content action (Optional): A click on the icon opens the content action menu.
3. Content area: Cards may also contain multiple types of content (e.g. a graph and an infobox).

![Basic Card Elements](images/card-usage-construction.png)

### Content actions (optional)

The content actions component is specified on [this page](../buttons-menus/content-actions.md).

The available options depend on the content, typical ones are:

- Immediately available actions (e.g. expand / reduce)
- Changing the view (e.g. toggle between data table and chart)
- Direct actions (e.g. download, export, share)
- Configuration (access to configuration mode)

### Images

Cards can include an image and be placed either vertically or horizontally.

![Card images](images/card-image.png)

### Accent line

An accent line can be used to highlight general, non-critical information.
This approach should be reserved for cases where it improves clarity or reinforces the card's purpose.

To prevent overuse and maintain its impact, the accent line should be applied selectively rather than to every card.
Use distinct colors, such as `$element-ui-0`, to emphasize information without implying urgency.

![Card accent line](images/card-accent-line.png)

For status indication, refer to the [value widget](../dashboards/value-widget.md).

### Card sizes

![Card sizes](images/card-usage-sizes.png)

To ensure an aligned visual grid and proper aesthetic of dashboards, card sizes follow the underlying 12 column grid of the work area.
The card can span over 3, 4, 6, 9 or 12 columns.

![Card grid](images/card-usage-grid.png)

The card's width is defined by a horizontal grid system. The necessary height is primarily driven by the content.
For visual aesthetic and reordering reasons, the number of height-sizes should be kept low and consistent.

### Full-screen view

Cards can be enlarged via the content action menu to get more detailed information. The card then uses the whole working area.
This makes sure that primary navigation, statusbar, notifications or other important information for the users are still accessible.
Dashboard wide settings like e.g. time-range filter shall not be visible. If `Expand` is the only content action, then the expand icon
is directly accessible, otherwise it will be part of the content actions list.

### Responsive behavior

With the bootstrap 12 column grid system in place, cards will first vary their width within certain breakpoints. As the screen size gets smaller and smaller cards will be stacked more and more.

## Code ---

For the maximize/restore functionality to work correctly the cards container/working area needs to have `position: relative;`.

### Usage

```ts
import { SiCardComponent } from '@siemens/element-ng/card';

@Component({
  imports: [SiCardComponent, ...]
})
```

The `si-card` component makes use of the card classes. The header
is configurable by input properties (see API). A header icon and the card body are
provided using content projection, with the selectors `headerIcon` and `body`.

When using header icon, make sure to include spacing between the icon and the heading. In
addition, the heading and text within the body should be left aligned. The CSS classes
`card-body` and `card-text` help to set the correct padding within the cards.

Try to avoid content overflows in cards. In case of overflows, make sure the scrollbar
is placed on the edge of the card and padding is set internally.

<si-docs-component example="si-card/si-card" height="300"></si-docs-component>

<si-docs-api component="SiCardComponent"></si-docs-api>

### Native HTML markup

#### Body

The `.card-body` class provides essential padding for content within a card. Use it as the primary container for text, images, or any other elements that need to be grouped and spaced correctly inside a `<div class="card">`.

```html
<div class="card">
  <div class="card-body">
  This is some text within a card body.
  </div>
</div>
```

#### Titles, text, and links

Use the following classes to style standard content elements within a card. It's best practice to place all these elements inside a `.card-body` container for correct padding and alignment.

- `.card-title` (on an `<h1>` through `<h6>`): Gives a large, primary heading to your card content.
- `.card-subtitle` (on an `<h1>` through `<h6>`): Used for secondary text below the title, often styled with a muted color or smaller font size for distinction.
- `.card-text` (on a `<p>` tag): The primary class for body text.
- `.card-link` (on an `<a>` tag): Styles a link to be used inside the card. Multiple links placed together will be spaced appropriately.

```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <h6 class="card-subtitle mb-2 text-secondary">Card subtitle</h6>
    <p class="card-text">
      Some quick example text to build on the card title and make up the bulk of the card’s
      content.
    </p>
    <a href="#" class="card-link">Card link</a>
    <a href="#" class="card-link">Another link</a>
  </div>
</div>
```

#### Images and text

To properly integrate an image with a card, apply the `.card-img-top` or `.card-img-bottom` class to your `<img>` element.
This automatically rounds the image's top or bottom corners to match the card's border radius.

```html
<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
```

#### List groups

### Card container

Bootstrap provides different container to manage and organize cards. The following takes the different
Bootstrap [card layout](https://getbootstrap.com/docs/5.1/components/card/#card-layout) container samples
and shows them with the Bootstrap card markup and the `si-card` components.

The samples help to ensure compatibility between the element components and Bootstrap design.

#### Card groups

See [Bootstrap documentation](https://getbootstrap.com/docs/5.1/components/card/#card-groups)

<si-docs-component example="si-card/bootstrap-card-group" height="500"></si-docs-component>

#### Grid cards

See [Bootstrap documentation](https://getbootstrap.com/docs/5.1/components/card/#grid-cards)

<si-docs-component example="si-card/bootstrap-card-grid" height="700"></si-docs-component>

<si-docs-types></si-docs-types>
