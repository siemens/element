import { Component } from '@angular/core';
import { SiPopoverLegacyDirective } from '@siemens/element-ng/popover-legacy';

@Component({
  selector: 'si-migration',
  imports: [SiPopoverLegacyDirective],
  templateUrl: './popover-template.html',
})
export class TemplateComponent {}
