import { Component } from '@angular/core';
import { SiPopoverDirective } from '@siemens/element-ng/popover';

@Component({
  selector: 'si-migration',
  imports: [SiPopoverDirective],
  templateUrl: './popover-template.html',
})
export class TemplateComponent {}
