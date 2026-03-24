/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  makeArc,
  makeLine,
  makePolyline,
  polarToCartesian,
  valueToRelativeAngle
} from './svg-math';

describe('polarToCartesian', () => {
  it('should convert 0 degrees to top of circle', () => {
    const result = polarToCartesian({ x: 50, y: 50 }, 40, 0);
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(10);
  });

  it('should convert 90 degrees to right of circle', () => {
    const result = polarToCartesian({ x: 50, y: 50 }, 40, 90);
    expect(result.x).toBeCloseTo(90);
    expect(result.y).toBeCloseTo(50);
  });

  it('should convert 180 degrees to bottom of circle', () => {
    const result = polarToCartesian({ x: 50, y: 50 }, 40, 180);
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(90);
  });

  it('should convert 270 degrees to left of circle', () => {
    const result = polarToCartesian({ x: 50, y: 50 }, 40, 270);
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(50);
  });
});

describe('makeArc', () => {
  it('should create a full circle path for 360 degree arc', () => {
    const path = makeArc({ x: 50, y: 50 }, 40, 0, 360);
    expect(path).toContain('A 40 40');
    expect(path).toContain('M 50 10');
    expect(path.endsWith('z')).toBe(true);
  });

  it('should create a normal arc for less than 360 degrees', () => {
    const path = makeArc({ x: 50, y: 50 }, 40, 0, 90);
    expect(path).toContain('A 40 40 0 0 0');
  });

  it('should use large arc flag for arcs greater than 180 degrees', () => {
    const path = makeArc({ x: 50, y: 50 }, 40, 0, 270);
    expect(path).toContain('A 40 40 0 1 0');
  });
});

describe('makeLine', () => {
  it('should create a line path between two points', () => {
    const path = makeLine({ x: 10, y: 20 }, { x: 30, y: 40 });
    expect(path).toBe('M 10 20 L 30 40');
  });
});

describe('makePolyline', () => {
  it('should create a polyline path from multiple points', () => {
    const path = makePolyline([
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 40 }
    ]);
    expect(path).toBe('M 0 0 L 10 20 L 30 40');
  });

  it('should handle a single point', () => {
    const path = makePolyline([{ x: 5, y: 10 }]);
    expect(path).toBe('M 5 10');
  });
});

describe('valueToRelativeAngle', () => {
  it('should calculate relative angle for a value in range', () => {
    const angle = valueToRelativeAngle(0, 180, 0, 100, 50);
    expect(angle).toBe(90);
  });

  it('should clamp values below min', () => {
    const angle = valueToRelativeAngle(0, 180, 0, 100, -10);
    expect(angle).toBe(0);
  });

  it('should clamp values above max', () => {
    const angle = valueToRelativeAngle(0, 180, 0, 100, 150);
    expect(angle).toBe(180);
  });
});
