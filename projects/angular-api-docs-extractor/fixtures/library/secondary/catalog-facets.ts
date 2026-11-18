import { Injectable } from '@angular/core';

export class RuntimeTarget {}

/** Runtime facet summary.
 * @deprecated Runtime facet deprecation.
 */
export const FacetedValue = RuntimeTarget;

/** Type facet summary.
 * @deprecated Type facet deprecation.
 */
export type FacetedValue = RuntimeTarget;

export const AnnotatedCallable: (value: string) => string = value => value;
export const InferredCallable = (value: string): string => value;

@Injectable()
class TypeOnlyService {
  private storage = '';
  static version = 1;

  constructor() {}
  save(value: string): void {
    this.storage = value;
  }
  load(): string {
    return this.readData();
  }
  private readData(): string {
    return this.storage;
  }
}

export type { TypeOnlyService };
