import { inject } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

export class MyClass {
  private resizeDirective = inject(SiResponsiveContainerDirective);

  myMethod() {
    console.log(this.resizeDirective.isXs);
    console.log(inject(SiResponsiveContainerDirective).isXs);
  }
}
