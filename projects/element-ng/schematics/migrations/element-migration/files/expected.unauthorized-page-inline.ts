import { Component } from '@angular/core';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';

@Component({
  selector: 'app-test-inline-unauthorized',
  standalone: true,
  imports: [SiInfoPageComponent],
  template: `
    <si-info-page icon="element-warning-filled" iconColor="status-warning"
      titleText="Access Restricted"
      copyText="You need special permissions to view this page."
      instructions="Contact admin@company.com for access."
      [link]="{ title: 'Return', link: '/home' }"
    ></si-info-page>

    <div class="error-container">
      <si-info-page icon="element-warning-filled" iconColor="status-warning"
        [titleText]="title"
        [copyText]="subtitle"
        [instructions]="instructions"
      ></si-info-page>
    </div>

    <!-- Multiple instances -->
    <si-info-page icon="element-warning-filled" iconColor="status-warning" titleText="Error 403"></si-info-page>
    <si-info-page icon="element-warning-filled" iconColor="status-warning"
      titleText="Permission Denied"
      copyText="Contact support"
    ></si-info-page>
  `
})
export class TestInlineUnauthorizedComponent {
  title = 'Not Authorized';
  subtitle = 'Your role does not permit access';
  instructions = 'Request access from your manager';
}
