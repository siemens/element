import { Component } from '@angular/core';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-test',
  template: '<div></div>'
})
export class TestComponent {
  checkSize(directive: SiResponsiveContainerDirective): void {
    // Property access patterns
    if (directive.xs()) {
      console.log('Extra small');
    }

    const small = directive.sm();
    const medium = directive.md();

    // In expressions
    const result = directive.lg() ? 'large' : 'not large';

    // Chained access
    const xl = this.getDirective().xl();

    // Multiple on same line
    if (directive.xs() || directive.sm() || directive.md()) {
      console.log('Small to medium');
    }

    // In template literal
    const msg = `Size is ${directive.xxl() ? 'XXL' : 'smaller'}`;

    // In logical expressions
    const responsive = directive.sm() && directive.md();
  }

  getDirective(): SiResponsiveContainerDirective {
    return null as any;
  }
}
