# Source chips

The **source chip** presents one or more sources behind generated or referenced content. Selecting
the chip opens a list of sources with their names and optional descriptions or quotes.

## Usage ---

Provide the sources through the `sources` input and handle `sourceClicked` to open the selected
source or show it in the application.

```ts
import { Component } from '@angular/core';
import { SiSourceChipComponent, type SourceReference } from '@siemens/element-ng/source-chip';

@Component({
  imports: [SiSourceChipComponent],
  template: `<si-source-chip compact [sources]="sources" (sourceClicked)="openSource($event)" />`
})
export class SourceChipExampleComponent {
  protected readonly sources: SourceReference[] = [
    {
      name: 'Annual Report 2025',
      url: 'https://example.com/annual-report',
      quote: 'Revenue increased by 12% in 2025.'
    }
  ];

  protected openSource(source: SourceReference): void {
    window.open(source.url, '_blank', 'noopener');
  }
}
```

Use `showLabel` to always display **Sources** instead of a source name, and `showIcon` to display
the source icon. Set `disabled` when source details must not be available.

## Code ---

<si-docs-component example="si-source-chip/si-source-chip" height="700"></si-docs-component>

<si-docs-api component="SiSourceChipComponent"></si-docs-api>

<si-docs-types></si-docs-types>
