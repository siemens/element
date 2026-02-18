import { Component } from '@angular/core';
import { elementAdd, elementClose, elementDelete } from '@simpl/element-ng/ionic';

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
