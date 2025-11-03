import { Component } from '@angular/core';
import { SiTabComponent, SiTabsetComponent } from '@simpl/element-ng';

@Component({
  selector: 'si-migration',
  imports: [SiTabComponent, SiTabsetComponent],
  template: `<si-tabset
  [(selectedTabIndex)]="selectedTabIndex"
>
  <si-tab heading="Legacy Tab 1">
    <p class="mt-4">In tab 1</p>
  </si-tab>
  <si-tab heading="Legacy Tab 2">
    <p class="mt-4">In tab 2</p>
  </si-tab>
</si-tabset>
`
})
export class TemplateComponent {
  readonly selectedTabIndex = 0;
}
