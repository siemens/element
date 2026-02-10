import { Component } from '@angular/core';
import { elementAdd, elementClose, elementDelete } from '@siemens/element-icons';

@Component({
  selector: 'app-test',
  template: '<div></div>'
})
export class TestComponent {
  icons = {
    add: elementAdd,
    close: elementClose,
    delete: elementDelete
  };
}
