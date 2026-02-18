import { Component } from '@angular/core';
import { SiUnauthorizedPageComponent } from '@siemens/element-ng/unauthorized-page';

@Component({
  selector: 'app-test-inline-unauthorized',
  standalone: true,
  imports: [SiUnauthorizedPageComponent],
  template: `
    <si-unauthorized-page
      heading="Access Restricted"
      subHeading="You need special permissions to view this page."
      description="Contact admin@company.com for access."
      [link]="{ title: 'Return', link: '/home' }"
    ></si-unauthorized-page>

    <div class="error-container">
      <si-unauthorized-page
        [heading]="title"
        [subHeading]="subtitle"
        [description]="instructions"
      ></si-unauthorized-page>
    </div>

    <!-- Multiple instances -->
    <si-unauthorized-page heading="Error 403"></si-unauthorized-page>
    <si-unauthorized-page
      heading="Permission Denied"
      subHeading="Contact support"
    ></si-unauthorized-page>
  `
})
export class TestInlineUnauthorizedComponent {
  title = 'Not Authorized';
  subtitle = 'Your role does not permit access';
  instructions = 'Request access from your manager';
}
