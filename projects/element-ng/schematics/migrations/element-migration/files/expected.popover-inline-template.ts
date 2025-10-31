import { Component } from '@angular/core';
import { SiPopoverLegacyDirective } from '@siemens/element-ng/popover-legacy';

@Component({
  selector: 'si-migration',
  imports: [SiPopoverLegacyDirective],
  template: `<button
    type="button"
    class="btn btn-secondary"
    siPopoverLegacy="Legacy popover content"
    popoverTitle="Popover on top"
    placement="top"
    triggers="focus"
  >
    Popover sample
  </button>`
})
export class TemplateComponent {}
