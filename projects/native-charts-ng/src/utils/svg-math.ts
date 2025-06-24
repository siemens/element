/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable prefer-arrow/prefer-arrow-functions */

/**
 * Cartesian coordinate
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Converts a polar coordinate to a cartesian
 * @param center - Center point of circle in cartesian coordinate
 * @param radius - Radius of circle
 * @param angleDeg - Angle in degrees
 * @returns cartesian coordinate
 */
export function polarToCartesian(center: Coordinate, radius: number, angleDeg: number): Coordinate {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad)
  };
}

/**
 * Creates a SVG path representing an arc
 * @param center - Center of circle in cartesian coordinate
 * @param radius - Radius of circle
 * @param startAngle - Start angel in degrees
 * @param endAngle - End angel in degrees
 * @returns SVG path string
 */
export function makeArc(
  center: Coordinate,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  // special case for full circle
  if ((endAngle - startAngle) % 360 === 0) {
    return (
      `M ${center.x} ${center.y - radius} ` +
      `A ${radius} ${radius} 0 1 0 ${center.x} ${center.y + radius} ` +
      `A ${radius} ${radius} 0 1 0 ${center.x} ${center.y - radius} z`
    );
  }

  // normal arc
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/**
 * Creates a SVG path representing a line
 * @param start - Start coordinate
 * @param end - End coordinate
 * @returns SVG path string
 */
export function makeLine(start: Coordinate, end: Coordinate): string {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Calculates the relative angle for a given value
 * @param minAngle - min/start angle in degrees
 * @param maxAngle - max/end angle in degrees
 * @param min - Min value
 * @param max - Max value
 * @param value - Value
 * @returns Relative (from minAngle) angle in degrees
 */
export function valueToRelativeAngle(
  minAngle: number,
  maxAngle: number,
  min: number,
  max: number,
  value: number
): number {
  value = Math.max(min, Math.min(max, value));
  return (value * (maxAngle - minAngle)) / (max - min);
}
