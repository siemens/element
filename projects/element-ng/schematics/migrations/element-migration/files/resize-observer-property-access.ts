import { Component, viewChild } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'si-test',
  template: `<div siResponsiveContainer></div>`
})
export class TestComponent {
  private readonly container = viewChild.required(SiResponsiveContainerDirective);

  checkSize(): void {
    if (this.container()?.isXs) {
      console.log('Extra small');
    }
    if (this.container()?.isSm) {
      console.log('Small');
    }
    if (this.container()?.isMd) {
      console.log('Medium');
    }
    if (this.container()?.isLg) {
      console.log('Large');
    }
    if (this.container()?.isXl) {
      console.log('Extra large');
    }
    if (this.container()?.isXxl) {
      console.log('Extra extra large');
    }
  }
}
