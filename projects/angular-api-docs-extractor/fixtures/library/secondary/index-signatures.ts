export interface IndexedOptions<T = unknown> {
  known?: T;
  /** Additional options keyed by name. */
  [key: string]: T | undefined;
}

export interface StringOptions extends IndexedOptions<string> {}

export interface ReadonlyValues {
  /** Values addressed by numeric position. */
  readonly [position: number]: string;
}

export type IndexedRecord = {
  [name: string]: ReadonlyValues;
};
