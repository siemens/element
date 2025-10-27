import { Component } from '@angular/core';
import { SiTabLegacyComponent, SiTabsetLegacyComponent } from '@simpl/element-ng';

@Component({
  selector: 'si-migration',
  imports: [SiTabLegacyComponent, SiTabsetLegacyComponent],
  template: `<si-tabset-legacy
  [(selectedTabIndex)]="selectedTabIndex"
>
  <si-tab-legacy heading="Legacy Tab 1">
    <p class="mt-4">In tab 1</p>
  </si-tab-legacy>
  <si-tab-legacy heading="Legacy Tab 2">
    <p class="mt-4">In tab 2</p>
  </si-tab-legacy>
</si-tabset-legacy>
`
})
export class TemplateComponent {
  readonly selectedTabIndex = 0;
}
