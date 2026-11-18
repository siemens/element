import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Injectable fixture. */
@Injectable({ providedIn: 'root' })
export class FixtureService {
  readonly documentToken = DOCUMENT;
  /** Makes a greeting.
   * @param name Who to greet.
   */
  greet(name = 'world'): string {
    return `Hello ${name}`;
  }
}
