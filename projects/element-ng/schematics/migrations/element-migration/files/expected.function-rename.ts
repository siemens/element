import { inject } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

export class MyClass {
  private resizeDirective = inject(SiResponsiveContainerDirective);

  myMethod() {
    console.log(this.resizeDirective.xs());
    console.log(inject(SiResponsiveContainerDirective).xs());

    console.log(this.resizeDirective.sm());
    console.log(inject(SiResponsiveContainerDirective).sm());

    console.log(this.resizeDirective.md());
    console.log(inject(SiResponsiveContainerDirective).md());

    console.log(this.resizeDirective.lg());
    console.log(inject(SiResponsiveContainerDirective).lg());

    console.log(this.resizeDirective.xl());
    console.log(inject(SiResponsiveContainerDirective).xl());

    console.log(this.resizeDirective.xxl());
    console.log(inject(SiResponsiveContainerDirective).xxl());
  }
}
