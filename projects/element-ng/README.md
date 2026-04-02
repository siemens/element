# Element Angular

The core Angular component library implementing the Siemens Design Language for Smart
Infrastructure applications. Provides 80+ production-ready UI components built with
Angular signals, standalone components, and OnPush change detection.

## Usage

Add the library to your project dependencies:

```sh
npm install --save @siemens/element-ng
```

Also install the required peer dependencies:

```sh
npm install --save @siemens/element-theme @siemens/element-icons @siemens/element-translate-ng @angular/cdk
```

Apply the global theme in your main stylesheet:

```scss
@use '@siemens/element-theme/theme';
```

Import individual components directly in your standalone components:

```ts
import { SiAccordionComponent } from '@siemens/element-ng/accordion';
import { SiButtonComponent } from '@siemens/element-ng/button';
import { SiModalService } from '@siemens/element-ng/modal';

@Component({
  selector: 'app-example',
  imports: [SiAccordionComponent, SiButtonComponent],
  templateUrl: './example.component.html'
})
export class ExampleComponent {}
```

Each component is available as a separate entry point under `@siemens/element-ng/<component>`.
Browse the full component catalog at [element.siemens.io](https://element.siemens.io).

### Running unit tests

Run `npm run lib:test` to run the unit tests via
[Karma](https://karma-runner.github.io).

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
