import { Injectable } from '@angular/core';
import { elementUser, elementSettings } from '@siemens/element-icons';

@Injectable()
export class IconService {
  getUserIcon() {
    return elementUser;
  }

  getSettingsIcon() {
    return elementSettings;
  }
}
