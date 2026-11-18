export class ExplicitConstructorService {
  readonly greeting: string;

  /** Builds a greeting.
   * @param name The greeting recipient.
   * @param labels Additional labels.
   */
  public constructor(name = 'world', ...labels: string[]) {
    this.greeting = name + labels.join();
  }
}

export class ProtectedConstructorService {
  readonly count: number;

  /** Builds a protected service.
   * @param count The initial count.
   */
  protected constructor(count = 5) {
    this.count = count;
  }
}

export class PrivateConstructorService {
  readonly count: number;

  private constructor(count = 1) {
    this.count = count;
  }
}

class GenericBase<T> {
  readonly value: T;

  /** Constructs the base service.
   * @param value The initial value.
   * @param suffix The default suffix.
   */
  constructor(value: T, suffix = 'base') {
    this.value = value;
    void suffix;
  }
}

export class InheritedConstructorService extends GenericBase<string> {}
