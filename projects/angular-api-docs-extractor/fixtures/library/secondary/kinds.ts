import { NgModule, Pipe, PipeTransform } from '@angular/core';

/** Fixture enum with initialized, computed and documented members. */
export enum FixtureState {
  /** Nothing happened yet. */
  Idle = 'idle',
  Busy = 'busy',
  /** @deprecated Use {@link FixtureState.Busy}. */
  Legacy = 'legacy'
}

/** Numeric enum without initializers. */
export enum FixturePriority {
  Low,
  High
}

/** Formats a fixture state. */
@Pipe({ name: 'fixtureState' })
export class FixtureStatePipe implements PipeTransform {
  /**
   * @param value The state to format.
   * @param upper Whether to upper-case the result.
   */
  transform(value: FixtureState, upper = false): string {
    return upper ? value.toUpperCase() : value;
  }
}

/** Bundles the fixture pipe. */
@NgModule({ imports: [FixtureStatePipe], exports: [FixtureStatePipe] })
export class FixtureModule {}
