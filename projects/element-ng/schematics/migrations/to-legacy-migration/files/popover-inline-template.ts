import { Component } from '@angular/core';
import { SiPopoverDirective } from '@siemens/element-ng/popover';

@Component({
  selector: 'si-migration',
  imports: [SiPopoverDirective],
  template: `<button
    type="button"
    class="btn btn-secondary"
    siPopover="Legacy popover content"
    popoverTitle="Popover on top"
    placement="top"
    triggers="focus"
  >
    Popover sample
  </button>`
})
export class TemplateComponent {}
