import { inject } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

export class MyClass {
  private resizeDirective = inject(SiResponsiveContainerDirective);

  myMethod() {
    console.log(this.resizeDirective.isXs);
    console.log(inject(SiResponsiveContainerDirective).isXs);

    console.log(this.resizeDirective.isSm);
    console.log(inject(SiResponsiveContainerDirective).isSm);

    console.log(this.resizeDirective.isMd);
    console.log(inject(SiResponsiveContainerDirective).isMd);

    console.log(this.resizeDirective.isLg);
    console.log(inject(SiResponsiveContainerDirective).isLg);

    console.log(this.resizeDirective.isXl);
    console.log(inject(SiResponsiveContainerDirective).isXl);

    console.log(this.resizeDirective.isXxl);
    console.log(inject(SiResponsiveContainerDirective).isXxl);
  }
}
