import { Component } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-migration',
  imports: [SiIconComponent],
  templateUrl: './icon-template.html'
})
export class TemplateComponent {
  readonly stack = 'stacked';
}
