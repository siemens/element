/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Route, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CopyrightDetails } from '@siemens/element-ng/copyright-notice';
import {
  AlertConfig,
  SiExplicitLegalAcknowledgeComponent,
  SiLandingPageComponent,
  SiLoginBasicComponent,
  UsernamePassword
} from '@siemens/element-ng/landing-page';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';

const loginAlert = signal<AlertConfig | undefined>(undefined);

@Component({
  selector: 'app-login-basic-wrapper',
  imports: [SiLoginBasicComponent, TranslateModule],
  template: `
    <si-login-basic
      usernameLabel="FORM.USERNAME"
      passwordLabel="FORM.PASSWORD"
      loginButtonLabel="FORM.LOGIN"
      [loading]="loading()"
      [forgotPasswordLink]="{
        title: 'FORM.FORGOT_PASSWORD',
        href: 'https://myid.siemens.com/help/'
      }"
      [registerNowLink]="{
        title: 'FORM.REGISTER_NOW',
        href: 'https://myid.siemens.com/help/'
      }"
      (valueChanged)="logEvent($event)"
      (login)="login($event)"
    />
  `
})
export class AppLoginBasicComponent {
  logEvent = inject(LOG_EVENT);
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly loading = signal<boolean>(false);

  login(data: UsernamePassword): void {
    if (!data.password || !data.username) {
      loginAlert.set({
        severity: 'danger',
        message: 'Please check your credentials and try again!'
      });
    } else {
      loginAlert.set(undefined);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username!);
      if (!isEmail) {
        loginAlert.set({
          severity: 'danger',
          message: 'Please provide a valid username!'
        });
      } else {
        this.loading.set(true);
        loginAlert.set(undefined);
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate(['eula'], { relativeTo: this.activeRoute.parent });
        }, 1500);
      }
    }
  }
}

@Component({
  selector: 'app-explicit-legal-acknowledge-wrapper',
  imports: [SiExplicitLegalAcknowledgeComponent],
  template: `
    <si-explicit-legal-acknowledge
      heading="EULA"
      subheading="End user license agreement"
      (back)="handleEulaBackClick()"
      (accept)="handleEulaAcceptance()"
    >
      <p>
        This End User License Agreement (“EULA”) sets forth the terms and conditions for the use of
        software, hardware, and related services (“Products” and “Services”). By accepting these
        terms, the user confirms to have read and understood this Agreement. If not accepted, the
        user must refrain from installing or using the Products or Services.
      </p>

      <h3 class="text-secondary">1. DEFINITIONS</h3>
      <p>“Software” means licensed applications, updates, and related documentation.</p>
      <p>“Hardware” means devices, equipment, or components provided under this Agreement.</p>
      <p>“Services” means support, maintenance, consulting, or professional activities offered.</p>
      <p>“Order” means the document or process confirming the purchase of Products or Services.</p>
      <p>“Documentation” means manuals, guides, or instructions supplied in any format.</p>

      <h3 class="text-secondary">2. ORDERS AND PAYMENTS</h3>
      <h4 class="text-secondary">2.1 Ordering</h4>
      <p>
        Products or Services may be purchased through an Order, which will be subject to this EULA
        and any applicable supplemental terms.
      </p>
      <h4 class="text-secondary">2.2 Delivery</h4>
      <p>
        Delivery of Software will usually occur electronically. Hardware may be delivered physically
        according to agreed terms.
      </p>
      <h4 class="text-secondary">2.3 Payment</h4>
      <p>
        Payments must be made according to the terms defined in the Order. Taxes, duties, and other
        charges are the responsibility of the customer unless exempt by law.
      </p>

      <h3 class="text-secondary">3. LICENSE TERMS</h3>
      <p>
        The user is granted a limited, non-exclusive, non-transferable license to use the Software
        and Documentation solely for internal purposes. Use is subject to all restrictions and
        applicable laws.
      </p>

      <h3 class="text-secondary">4. WARRANTIES AND DISCLAIMERS</h3>
      <p>
        Products and Services are provided “as is” unless otherwise stated. No guarantee is made
        that they will be error-free or uninterrupted.
      </p>

      <h3 class="text-secondary">5. LIMITATION OF LIABILITY</h3>
      <p>
        Liability is limited to the amount paid for the relevant Product or Service. Indirect,
        incidental, or consequential damages are excluded to the maximum extent permitted by law.
      </p>

      <h3 class="text-secondary">6. TERMINATION</h3>
      <p>
        This Agreement may be terminated if the user breaches its terms or fails to comply with
        payment obligations. Upon termination, all rights to use the Products and Services cease
        immediately.
      </p>

      <h3 class="text-secondary">7. COMPLIANCE</h3>
      <p>
        The user agrees to comply with applicable laws, including export control, data protection,
        and confidentiality obligations.
      </p>

      <h3 class="text-secondary">8. FINAL PROVISIONS</h3>
      <p>
        This Agreement represents the entire understanding between the parties and supersedes prior
        discussions. Any conflicting terms are void unless expressly agreed in writing.
      </p>
    </si-explicit-legal-acknowledge>
  `
})
export class AppEulaComponent {
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  logEvent = inject(LOG_EVENT);

  handleEulaAcceptance(): void {
    this.logEvent('You have accepted the EULA!');
  }

  handleEulaBackClick(): void {
    this.router.navigate(['login'], { relativeTo: this.activeRoute.parent });
  }
}

export const ROUTES: Route[] = [
  {
    path: 'login',
    component: AppLoginBasicComponent
  },
  {
    path: 'eula',
    component: AppEulaComponent
  }
];

@Component({
  selector: 'app-sample',
  imports: [SiLandingPageComponent, RouterOutlet, TranslateModule],
  templateUrl: './si-landing-page-eula.html',
  providers: [provideExampleRoutes(ROUTES)],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit, OnDestroy {
  private activeRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly loginAlert = loginAlert;

  copyrightDetails: CopyrightDetails = {
    startYear: 2021,
    lastUpdateYear: 2023,
    company: 'Example Company'
  };

  ngOnInit(): void {
    this.router.navigate(['eula'], { relativeTo: this.activeRoute });
  }

  ngOnDestroy(): void {
    loginAlert.set(undefined);
  }
}
