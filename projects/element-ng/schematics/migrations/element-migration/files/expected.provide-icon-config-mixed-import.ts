import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { addIcons } from '@siemens/element-ng/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: 'ICONS', useValue: addIcons({ 'icon': 'icon' }) }
  ]
};
