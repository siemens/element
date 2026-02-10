import { Injectable } from '@angular/core';
import { elementUser, elementSettings } from '@simpl/element-ng/svg';

@Injectable()
export class IconService {
  getUserIcon() {
    return elementUser;
  }

  getSettingsIcon() {
    return elementSettings;
  }
}
