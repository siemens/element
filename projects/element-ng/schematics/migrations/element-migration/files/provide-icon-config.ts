import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideIconConfig } from '@siemens/element-ng/icon';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideIconConfig({ disableSvgIcons: true })]
};
