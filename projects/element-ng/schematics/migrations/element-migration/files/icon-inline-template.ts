import { Component } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'si-migration',
  imports: [SiIconComponent],
  template: `<si-icon icon="element-help" stackedColor="green" [stackedIcon]="stack" />
    <si-icon icon="element-help" stackedColor="green" [stackedIcon]="stack"
      ></si-icon
    >`
})
export class TemplateComponent {
  readonly stack = 'stacked';
}
