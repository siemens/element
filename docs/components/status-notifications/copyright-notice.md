# Copyright notice

**Copyright notice** is a component to display an application's copyright information,
including the company name along with the copyright's start and last-updated year.

## Code ---

Use the `si-copyright-notice` component to display an application's copyright information.

### Usage

It is recommended to provide the `SI_COPYRIGHT_DETAILS` injection token on a global level to
make sure the copyright information are in sync across the whole app. Depending on your use case, 
you can also pass the copyright details via input property as shown in the live example below.

```ts
import { SiCopyrightNoticeComponent } from '@spike-rabbit/element-ng/copyright-notice';

@Component({
  imports: [SiCopyrightNoticeComponent, ...],
  providers: [
    {
      provide: SI_COPYRIGHT_DETAILS, 
      useValue: {
          company: 'Your Company',  // Defaults to `Sample Company`
          startYear: 2021,
          lastUpdateYear: 2025
      }
    }
  ]
})
```

<si-docs-component example="si-copyright-notice/si-copyright-notice"></si-docs-component>

<si-docs-api component="SiCopyrightNoticeComponent"></si-docs-api>

<si-docs-types></si-docs-types>
