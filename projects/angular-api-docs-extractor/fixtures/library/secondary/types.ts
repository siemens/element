export namespace helpers {
  /** Namespaced options. */
  export interface Options {
    value: string;
  }
}

/** A documented function.
 * @param value The value.
 */
export function withDefault(value?: string): string;
export function withDefault(value = 'default'): string {
  return value;
}

export function useOptions(
  // Keep distinct parameter lines for documentation source-location coverage.
  options: LocalOptions,
  deep: DeepOptions
): string {
  return options.value + deep.deep;
}
import type { DeepOptions } from './deep';

/** A truly local signature type. */
interface LocalOptions {
  /** Local value. */
  value: string;
}
