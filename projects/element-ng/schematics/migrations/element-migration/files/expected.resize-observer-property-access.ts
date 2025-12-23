import { Component, viewChild } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'si-test',
  template: `<div siResponsiveContainer></div>`
})
export class TestComponent {
  private readonly container = viewChild.required(SiResponsiveContainerDirective);

  checkSize(): void {
    if (this.container()?.xs()) {
      console.log('Extra small');
    }
    if (this.container()?.sm()) {
      console.log('Small');
    }
    if (this.container()?.md()) {
      console.log('Medium');
    }
    if (this.container()?.lg()) {
      console.log('Large');
    }
    if (this.container()?.xl()) {
      console.log('Extra large');
    }
    if (this.container()?.xxl()) {
      console.log('Extra extra large');
    }
  }
}
