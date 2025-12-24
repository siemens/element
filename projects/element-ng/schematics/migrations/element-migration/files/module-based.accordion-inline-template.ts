import { Component } from '@angular/core';

@Component({
  selector: 'si-migration',
  standalone: false,
  template: `<si-accordion colorVariant="base-0">
      <si-collapsible-panel heading="Hey there">
        <div class="p-6"> Here is some content </div>
      </si-collapsible-panel>
      </si-accordion>`
})
export class ModuleBasedAccordionInlineTemplateComponent {}
