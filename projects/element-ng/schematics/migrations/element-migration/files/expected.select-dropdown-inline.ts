import { Component } from '@angular/core';
import { SelectOption, SiSelectComponent } from '@siemens/element-ng/select';

@Component({
  selector: 'app-test-inline',
  template: `
    <si-select
      [options]="options"
      (openChange)="onClose()"
    ></si-select>

    <div>
      <si-select
        [options]="items"
        (openChange)="handleDropdownClose($event)"
        (valueChange)="handleValueChange($event)"
      ></si-select>
    </div>
  `,
  imports: [SiSelectComponent]
})
export class TestInlineComponent {
  options: SelectOption<string>[] = [];
  items: SelectOption<number>[] = [];

  onClose(): void {
    console.log('Closed');
  }

  handleDropdownClose(isOpen: boolean): void {
    console.log('Dropdown state:', isOpen);
  }

  handleValueChange(value: string | number): void {
    console.log('Value:', value);
  }
}
