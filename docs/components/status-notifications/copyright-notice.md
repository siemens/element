# Copyright notice

**Copyright notice** is a component to display an application's copyright information,
including the company name along with the copyright's start and last-updated year.

## Code ---

Use the `si-copyright-notice` component to display an application's copyright information.

### Usage

The copyright notice must only be defined once in the `app.config.ts` or in the `app.module.ts`.
Local overrides as in previous versions are no longer supported.

```ts
import { SiCopyrightNoticeComponent, provideCopyrightDetails } from '@siemens/element-ng/copyright-notice';

const appConfig: ApplicationConfig = {
  providers: [
    provideCopyrightDetails({ 
      company: 'Your Company',  // Defaults to `Sample Company`
      startYear: 2021,
      lastUpdateYear: 2025
    })
  ]
};

@Component({
  imports: [SiCopyrightNoticeComponent, ...],
  template: `
    <si-copyright-notice></si-copyright-notice>
  `
})
```

<si-docs-component example="si-copyright-notice/si-copyright-notice"></si-docs-component>

<si-docs-api component="SiCopyrightNoticeComponent"></si-docs-api>

<si-docs-types></si-docs-types>
