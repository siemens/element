import { ApplicationConfig } from '@angular/core';
import { provideIconConfig } from '@siemens/element-ng/icon';

export const appConfig: ApplicationConfig = {
  providers: [provideIconConfig({ disableSvgIcons: true })]
};
