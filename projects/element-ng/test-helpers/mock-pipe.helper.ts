import { Pipe } from '@angular/core';
import { vi } from 'vitest';

/**
 * Create a new pipe with name for tests.
 *
 * @see https://stackoverflow.com/questions/39293258/how-to-mock-pipe-when-testing-component/41826482#41826482
 * ```ts
 *  translateSpy = jasmine.createSpy().and.callFake((value: any) => value);
 *  TestBed.configureTestingModule({
 *    declarations: [
 *      SomeComponent,
 *      mockPipe({ name: 'translate' }, translateSpy)
 *    ],
 *    // ...
 *  }).compileComponents();
 * ```
 */
export function mockPipe(
  options: Pipe,
  transformCall: (value: any, ...args: any[]) => any = vi.fn()
): Pipe {
  const metadata: Pipe = {
    name: options.name
  };

  return <any>Pipe(metadata)(
    class MockPipe {
      transform(value: any, ...args: any[]): any {
        return transformCall(value, args);
      }
    }
  );
}
