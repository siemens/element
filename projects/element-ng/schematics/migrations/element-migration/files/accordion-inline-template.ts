import { Component } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'si-migration',
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent],
  template: `<si-accordion colorVariant="base-0">
      <si-collapsible-panel heading="Hey there">
        <div class="p-6"> Here is some content </div>
      </si-collapsible-panel>
      </si-accordion>`
})
export class TemplateComponent {}
