import { Component } from '@angular/core';
import { SimplElementNgModule } from '@simpl/element-ng';
import { SiAboutModule } from '@simpl/element-ng/about';
import { SiAccordionModule } from '@simpl/element-ng/accordion';

@Component({
  selector: 'app-test',
  template: '',
  imports: [SimplElementNgModule, SiAboutModule, SiAccordionModule]
})
export class MyComponent {}
