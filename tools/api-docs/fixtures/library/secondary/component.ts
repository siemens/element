import {
  Component,
  DOCUMENT,
  Directive,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  input,
  model
} from '@angular/core';
import type { ExternalContract } from '../../external/contract';

const DEFAULT_COUNT = 12;

function decodePosition(value: unknown): number {
  return Number(value);
}

@Directive({ selector: '[fixture-deep-host]' })
class DeepHostDirective {
  /** A recursively forwarded input. */
  readonly deepLabel = input('deep');
}

@Directive({
  selector: '[fixture-host]',
  hostDirectives: [{ directive: DeepHostDirective, inputs: ['deepLabel: innerDeep'] }]
})
class HostDirective {
  readonly count = input<number | undefined, unknown>(undefined, {
    alias: 'rawCount',
    transform: decodePosition
  });
  /** The forwarded label.
   * @defaultValue 'forwarded'
   */
  readonly label = input.required<string>({ alias: 'hostLabel' });
  @Output() readonly changed = new EventEmitter<string>();
  /** Must not leak through the host. */
  readonly hidden = input('hidden');
}

@Directive()
export class BaseDirective {
  /** Inherited input. */
  @Input({ alias: 'baseAlias', required: true }) base = 'base';
  protected inheritedProtected = true;
}

/** A signal-backed component.
 * @public
 */
@Component({
  selector: 'fixture-component',
  exportAs: 'fixture',
  template: '',
  hostDirectives: [
    {
      directive: forwardRef(() => HostDirective),
      inputs: ['hostLabel: label', 'innerDeep: nestedLabel', 'rawCount: transformedCount'],
      outputs: ['changed: labelChange']
    }
  ]
})
export class FixtureComponent<T extends string = string> extends BaseDirective {
  transformedCount?: number;
  readonly documentToken = DOCUMENT;
  /** Current value. */
  readonly value = model(3, { alias: 'current' });
  /** Required title. */
  readonly title = input.required<string>({ alias: 'heading' });
  /** Number of items.
   * @defaultref DEFAULT_COUNT
   */
  @Input() count = DEFAULT_COUNT;
  /** Overrides AST initialization.
   * @defaultValue 42
   */
  public explicit = 0;
  readonly literal = 'literal';
  protected protectedMember = false;
  private privateMember = true;
  /** @internal */
  internalMember = true;
  /** @public */
  documentedPublic = true;
  /** A method.
   * @param text The text.
   */
  public format(text: T, count = 2): string {
    return text.repeat(count);
  }
  consume(contract: ExternalContract): string | undefined {
    return contract.value;
  }
}
