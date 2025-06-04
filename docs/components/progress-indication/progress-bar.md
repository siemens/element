# Progress Bar

**Progress bars** notify users that an app needs more time to process a user action,
and if possible tell how much time (approximately) it will take.

## Usage ---

Progress bars inform users about the status of ongoing processes, such as loading an app,
documents or data, submitting a form, saving data and more.

### When to use

Use a progress bar for any action that takes longer than about **one second**.
Anything shorter than that will act distracting to users.

### Dos and don'ts

- An application should provide visual feedback for any extended waiting/loading period.
- Progress bars shall be used for non-blocking waiting/loading actions.

## Design ---

A Progress Bar consists of the following elements:

![Progressbar](images/progress-bar.png)

> 1. Label (optional), 2. Progress, 3. Track, 4. Value (optional)

Besides the default size, there is also a small variant available.

![Progressbar Variations](images/progress-bar-usage-variations.png)

> 1. Default, 2. Small

## Code ---

### Usage

```ts
import { SiProgressbarComponent } from '@siemens/element-ng/progressbar';

@Component({
  imports: [SiProgressbarComponent, ...]
})
```

<si-docs-component example="si-progressbar/si-progressbar-dynamic" height="250"></si-docs-component>

<si-docs-api component="SiProgressbarComponent"></si-docs-api>

<si-docs-types></si-docs-types>
