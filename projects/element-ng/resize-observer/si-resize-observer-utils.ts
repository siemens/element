/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
const isSVG = (target: Element): boolean => target instanceof SVGElement && 'getBBox' in target;

const parseDimension = (pixel: string | null): number => parseFloat(pixel ?? '0');

export const getElementSize = (
  element: Element,
  box: 'content-box' | 'border-box'
): { width: number; height: number } => {
  let width = element.clientWidth;
  let height = element.clientHeight;
  if (box === 'border-box') {
    // The border box calculation is based on https://github.com/juggle/resize-observer
    const cs = getComputedStyle(element);
    const svg =
      isSVG(element) &&
      (element as SVGElement).ownerSVGElement &&
      (element as SVGGraphicsElement).getBBox();
    const canScrollVertically = !svg && /auto|scroll/.test(cs.overflowY || '');
    const canScrollHorizontally = !svg && /auto|scroll/.test(cs.overflowX || '');
    const removePadding = cs.boxSizing === 'border-box';
    const paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
    const paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
    const paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
    const paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
    const borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
    const borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
    const borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
    const borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
    const horizontalPadding = paddingLeft + paddingRight;
    const verticalPadding = paddingTop + paddingBottom;
    const horizontalBorderArea = borderLeft + borderRight;
    const verticalBorderArea = borderTop + borderBottom;
    const widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
    const heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
    const horizontalScrollbarThickness = !canScrollHorizontally
      ? 0
      : (element as HTMLElement).offsetHeight - verticalBorderArea - element.clientHeight;
    const verticalScrollbarThickness = !canScrollVertically
      ? 0
      : (element as HTMLElement).offsetWidth - horizontalBorderArea - element.clientWidth;

    const contentWidth = svg
      ? svg.width
      : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
    const contentHeight = svg
      ? svg.height
      : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
    width = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
    height = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
  }
  return { width, height };
};
