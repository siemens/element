import {
  Directive,
  Injectable as AngularService,
  input,
  input as aliasedInput,
  model,
  output
} from '@angular/core';
import * as angularCore from '@angular/core';

export interface ParentContract<T> {
  inheritedContract(value: T): T;
}

export interface Contract<T> extends ParentContract<T> {
  value: T;
  convert(value: T): T;
}

export class GenericParent<T> implements Contract<T> {
  value!: T;
  convert(value: T): T {
    return value;
  }
  inheritedContract(value: T): T {
    return value;
  }
  identity<T>(value: T): T {
    return value;
  }
}

export class MetadataChild extends GenericParent<string> implements Contract<string> {
  override convert(value: string): string {
    return value;
  }
}

export class MetadataMiddle<U> extends GenericParent<U[]> {}
export class MetadataGrandchild extends MetadataMiddle<string> {}

/** String overload.
 * @param value The string value.
 */
export function overloaded(value: string): string;
/** Numeric overload.
 * @param value The numeric value.
 */
export function overloaded(value: number): number;
/** Generic overload. */
export function overloaded<T extends string | number = string>(value: T, fallback?: T): T;
/** The implementation. */
export function overloaded(value: string | number, fallback: string | number = 0): string | number {
  return value ?? fallback;
}

/** Overloaded operations.
 * @example
 * ```ts
 * const result = '  preserve spacing';
 * ```
 *
 * ```typescript
 * const value: string = '<literal>&';
 * ```
 *
 * ```html
 * <test-widget [value]="value" />
 * ```
 *
 * ```css
 * .example {
 *   color: red;
 * }
 * ```
 *
 * ```sh
 * echo '<literal>&'
 * ```
 * @example
 * ~~~html
 * <test-widget>
 *   Tilde fence
 * </test-widget>
 * ~~~
 * @example
 *
 * ```
 * unlabelled <literal>&
 * ```
 * @example
 * bare <literal>&
 */
export class MetadataOverloads {
  /** String construction. */
  constructor(value: string);
  /** Numeric construction. */
  constructor(value: number);
  /** Actual construction.
   * @param value Initial value.
   */
  constructor(value: string | number = 1) {
    void value;
  }

  /** String method. */
  convert(value: string): string;
  /** Numeric method. */
  convert(value: number): number;
  /** Actual method.
   *
   * ```ts
   * const result = '  preserve spacing';
   * ```
   * @param value The value.
   */
  convert(value: string | number): string | number {
    return value;
  }
}

@AngularService()
export class UnprovidedService {}

function Injectable(): ClassDecorator {
  return () => undefined;
}

@Injectable()
export class PretendService {}

function fakeInput(value: number): () => number {
  return () => value;
}

function decodeTokens(value: unknown): number {
  return Number(value);
}
const sharedTransformOptions = { transform: decodeTokens };
const referencedTransformOptions = { ...sharedTransformOptions, alias: 'converted' };

@Directive()
export class SignalMetadata {
  readonly requiredConverted = input.required<number, unknown>({ transform: decodeTokens });
  readonly optionalCount = input<number>();
  /** Documented count.
   * @defaultValue 99
   */
  readonly count = input<number | undefined>(1);
  readonly requiredTitle = input.required<string>({ alias: 'label' });
  readonly modelValue = model<string>('start');
  readonly requiredModel = model.required<string>();
  readonly namespaceInput = angularCore.input<number>(2);
  readonly aliasInput = aliasedInput<number>(3);
  readonly customInput = fakeInput(3);
  /** Plain property.
   * @defaultValue 42
   */
  readonly plain = 17;
}

// Referenced/spread options can be inspected through TypeScript even when Angular
// cannot use them as a decorated directive's statically analyzable configuration.
export class ReferencedTransformMetadata {
  readonly converted = input<number | undefined, unknown>(undefined, referencedTransformOptions);
  readonly spreadConverted = input<number | undefined, unknown>(undefined, {
    ...sharedTransformOptions
  });
  readonly requiredConverted = input.required<number, unknown>(sharedTransformOptions);
}

interface HiddenPayload {
  privateOnly: string;
}

export class VisibilityMetadata {
  visible = 1;
  /** Private subject.
   * @defaultValue 'documented'
   */
  private actionSubject = 'actual';
  private payload!: HiddenPayload;
  private static cached = false;
  /** Internal implementation.
   * @internal
   */
  internalWork(value = 2): number {
    return value;
  }
}

@Directive()
export class SelectionBase<T, IV> {
  value?: IV;
  readonly valueInput = input<IV>();
  readonly valueChange = output<IV>();
}

@Directive()
export class SelectionChild<T> extends SelectionBase<T, T> {}

export class AccessorMetadata {
  private current = 0;
  /** Reads the current value. */
  get value(): number {
    return this.current;
  }
  /** Writes the current value.
   * @defaultValue 3
   */
  set value(value: number) {
    this.current = value;
  }
}

export class ReadonlyAccessors<T> {
  /** The accessed content, not a callable member. */
  get content(): T {
    return undefined as T;
  }

  get activeToasts(): string[] {
    return [];
  }
}

export class InheritedAccessors extends ReadonlyAccessors<string> {}

export class CallbackProperties<T> {
  detach: () => void = () => {};
  hide: (reason?: T) => void = () => {};
  isCurrent: () => boolean = () => false;
  readonly transform = (value: T): T => value;

  setInput(value: T): void {}
}

export class InheritedCallbacks extends CallbackProperties<string> {}

/** A deliberately exported internal directive.
 * @internal
 */
@Directive({ selector: '[internal-fixture]', exportAs: 'internalFixture' })
export class InternalDirective {
  /** Required internal input. */
  readonly count = input.required<number>({ alias: 'insideCount' });
  private hidden = 1;
  /** @internal */
  internalMember = 2;
}

/** An exported internal function.
 * @internal
 * @param name The name.
 */
export function internalFunction(name = 'default'): string {
  return name;
}
