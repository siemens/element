import { Component } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-test',
  template: '<div></div>'
})
export class TestComponent {
  checkSize(directive: SiResponsiveContainerDirective): void {
    // Property access patterns
    if (directive.isXs) {
      console.log('Extra small');
    }

    const small = directive.isSm;
    const medium = directive.isMd;

    // In expressions
    const result = directive.isLg ? 'large' : 'not large';

    // Chained access
    const xl = this.getDirective().isXl;

    // Multiple on same line
    if (directive.isXs || directive.isSm || directive.isMd) {
      console.log('Small to medium');
    }

    // In template literal
    const msg = `Size is ${directive.isXxl ? 'XXL' : 'smaller'}`;

    // In logical expressions
    const responsive = directive.isSm && directive.isMd;
  }

  getDirective(): SiResponsiveContainerDirective {
    return null as any;
  }
}
