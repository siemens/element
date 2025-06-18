/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { getFieldValue, getKeyPath } from './utils';

describe('element form utils', () => {
  describe('getKeyPath', () => {
    it('should handle a string path', () => {
      const path = 'foo.bar.golang.rulez';
      expect(getKeyPath(path)).toEqual(['foo', 'bar', 'golang', 'rulez']);
    });

    it('should handle an pointless string path', () => {
      const path = 'foo';
      expect(getKeyPath(path)).toEqual(['foo']);
    });

    it('should handle an array like string path', () => {
      const path = 'foo.bar.golang[0].rulez';
      expect(getKeyPath(path)).toEqual(['foo', 'bar', 'golang', '0', 'rulez']);
    });

    it('should handle an empty path', () => {
      const path = '';
      expect(getKeyPath(path)).toEqual([]);
    });

    it('should handle an undefined path', () => {
      expect(getKeyPath()).toEqual([]);
    });

    it('should handle an array as path', () => {
      const path = ['foo', 'bar', 'golang', 'rulez'];
      expect(getKeyPath(path)).toEqual(path);
    });

    it('should handle a number as path', () => {
      expect(getKeyPath(1)).toEqual(['1']);
    });
  });
});

describe('getFieldValue', () => {
  const model = {
    foo: {
      golang: 'rulez',
      rust: {
        rulez: 'also'
      },
      array: ['1st', '2nd', '3rd']
    }
  };

  it('should handle a model path', () => {
    expect(getFieldValue(model, ['foo', 'golang'])).toEqual('rulez');
  });

  it('should resolve an object', () => {
    expect(getFieldValue(model, ['foo', 'rust'])).toEqual(model.foo.rust);
  });

  it('should resolve an array value', () => {
    expect(getFieldValue(model, ['foo', 'array', '1'])).toEqual('2nd');
  });

  it('should handle a null value', () => {
    expect(getFieldValue(undefined, ['foo'])).toEqual(undefined);
  });
});
