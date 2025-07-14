/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isRTL } from './rtl';

export type Direction = 'down' | 'up' | 'start' | 'end';
export type PlacementBasicVertical = 'top' | 'bottom';
export type PlacementBasic = 'start' | 'end' | PlacementBasicVertical;
export type Placement = '' | PlacementBasic | `${PlacementBasic} ${PlacementBasic}`;
export type Align = 'start' | 'center' | 'end';

export const AXIS_X = {
  axis: 'X',
  directionRegular: 'end',
  directionReverse: 'start',
  upperBound: 'left',
  lowerBound: 'right',
  size: 'width',
  windowSize: 'innerWidth'
} as const;
export const AXIS_Y = {
  axis: 'Y',
  directionRegular: 'down',
  directionReverse: 'up',
  upperBound: 'top',
  lowerBound: 'bottom',
  size: 'height',
  windowSize: 'innerHeight'
} as const;
export const BOUNDING_RECT_WINDOW = {
  getBoundingClientRect: () => ({
    top: 0,
    left: 0,
    bottom: window.innerHeight,
    right: window.innerWidth
  })
};

export const resolveReference = (
  hostElement: HTMLElement,
  reference: string
): HTMLElement | null => {
  if (reference) {
    const childReferenceCheck = hostElement.querySelector(reference);
    if (childReferenceCheck) {
      return childReferenceCheck as HTMLElement;
    }
    const referenceCheck = hostElement.closest(reference);
    if (referenceCheck) {
      return referenceCheck as HTMLElement;
    }
    const all = document.querySelectorAll(reference);
    return (all[all.length - 1] as HTMLElement) ?? null;
  }
  return null;
};

const getScrollParentsChain = (
  element: HTMLElement | null,
  axis: 'X' | 'Y',
  scrollParentsList: (typeof BOUNDING_RECT_WINDOW)[] = []
): (typeof BOUNDING_RECT_WINDOW)[] => {
  if (element) {
    const overflowStyle =
      getComputedStyle(element)[axis === 'X' ? 'overflowX' : 'overflowY'] || 'visible';
    if (
      element[axis === 'X' ? 'clientWidth' : 'clientHeight'] &&
      overflowStyle !== 'visible' &&
      overflowStyle !== 'hidden'
    ) {
      scrollParentsList.push(document.documentElement === element ? BOUNDING_RECT_WINDOW : element);
    }
    if (element !== document.documentElement) {
      getScrollParentsChain(
        (element as any).dropdownParentElement ?? element.parentElement ?? document.body,
        axis,
        scrollParentsList
      );
    }
  }
  return scrollParentsList;
};

const getCombinedBoundingClientRect = (
  elements: HTMLElement[]
): { top: number; bottom: number; left: number; right: number } => {
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  if (elements.length > 0) {
    const tops: number[] = [];
    const bottoms: number[] = [];
    const lefts: number[] = [];
    const rights: number[] = [];
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      tops.push(rect.top);
      bottoms.push(rect.bottom);
      lefts.push(rect.left);
      rights.push(rect.right);
    });
    top = Math.min(...tops);
    bottom = Math.max(...bottoms);
    left = Math.min(...lefts);
    right = Math.max(...rights);
  }
  return { top, bottom, left, right };
};

const calculatePlacementRefOuterBounds = (
  currentAxis: typeof AXIS_X | typeof AXIS_Y,
  placementReferenceElement: HTMLElement | null
): { upper: number; lower: number } => {
  // The chain of scroll parents of the placement ref element up to and often including the body, checking for possible overlaps.
  const placementRefScrollParents = getScrollParentsChain(
    placementReferenceElement,
    currentAxis.axis
  );
  const placementRefScrollParentRects = placementRefScrollParents.map(item =>
    item.getBoundingClientRect()
  );
  // The biggest upper bound (top, left) of all scroll parents (and viewport = 0), the point before which content will be cut off.
  const placementRefScrollParentsUpperBound = Math.max(
    0,
    ...placementRefScrollParentRects.map(item => item[currentAxis.upperBound])
  );
  // The smallest lower bound (bottom, right) of all scroll parents (and viewport), the point after which content will be cut off.
  const placementRefScrollParentsLowerBound = Math.min(
    window[currentAxis.windowSize],
    ...placementRefScrollParentRects.map(item => item[currentAxis.lowerBound])
  );
  return { upper: placementRefScrollParentsUpperBound, lower: placementRefScrollParentsLowerBound };
};

const calculateDirectionFromPlacementRef = (params: {
  currentAxis: typeof AXIS_X | typeof AXIS_Y;
  positionRegular: { left: number; top: number };
  positionReverse: { left: number; top: number };
  contentSize: number;
  placementRefBounds: { upper: number; lower: number };
  currentDirection: Direction;
  rtl?: boolean;
}): Direction => {
  const {
    currentAxis,
    positionRegular,
    positionReverse,
    contentSize,
    placementRefBounds,
    currentDirection,
    rtl
  } = params;
  // A number showing how many visible pixels would be available from the placement ref in regular / scroll (down, end) direction
  const placementRefSpaceRegular =
    placementRefBounds.lower - positionRegular[currentAxis.upperBound];
  // A number showing how many visible pixels would be available from the placement ref in reverse (up, start) direction
  const placementRefSpaceReverse =
    positionReverse[currentAxis.upperBound] - placementRefBounds.upper;
  if (placementRefSpaceReverse < contentSize && placementRefSpaceRegular < contentSize) {
    // If there would not be enough room in both directions, always prefer regular / scroll (down, end) direction,
    // since this way the element can expand and scroll while this cannot happen if there's not enough room in front.
    return rtl ? currentAxis.directionReverse : currentAxis.directionRegular;
  } else if (placementRefSpaceReverse < contentSize) {
    return currentAxis.directionRegular;
  } else if (placementRefSpaceRegular < contentSize) {
    return currentAxis.directionReverse;
  }
  // If there would be enough room in both directions, use the set direction (or the regular one if not set).
  return currentDirection;
};

const getAbsoluteContentPosition = (params: {
  direction: Direction;
  placement: Placement;
  element: HTMLElement;
  align: Align;
  rtl?: boolean;
}): { left: number; top: number } => {
  const { direction, placement, element, align, rtl } = params;
  const elementRect = element.getBoundingClientRect();

  const start = rtl ? elementRect.right : elementRect.left;
  const end = rtl ? elementRect.left : elementRect.right;

  let relativeLeftOffset = 0;
  if (direction === 'start' || direction === 'end') {
    relativeLeftOffset =
      placement.includes('end') || (!placement.includes('start') && direction === 'end')
        ? end
        : start;
  } else {
    if (placement.includes('start')) {
      relativeLeftOffset = start;
    } else {
      if (placement.includes('end') || align === 'end') {
        relativeLeftOffset = end;
      } else if (align === 'center') {
        relativeLeftOffset = elementRect.left + (elementRect.right - elementRect.left) / 2;
      } else {
        relativeLeftOffset = start;
      }
    }
  }
  let relativeTopOffset = 0;
  if (direction === 'up') {
    relativeTopOffset = placement.includes('bottom') ? elementRect.bottom : elementRect.top;
  } else if (direction === 'start' || direction === 'end') {
    relativeTopOffset = !placement.includes('bottom') ? elementRect.top : elementRect.bottom;
  } else {
    relativeTopOffset = placement.includes('top') ? elementRect.top : elementRect.bottom;
  }
  return { left: relativeLeftOffset, top: relativeTopOffset };
};

const getRelativeContentPosition = (params: {
  contentElement: HTMLElement;
  direction: Direction;
  placement: Placement;
  placementReferenceElement: HTMLElement;
  align: Align;
  rtl?: boolean;
}): { left: number; top: number } => {
  const { contentElement, direction, placement, placementReferenceElement, align, rtl } = params;
  const contentParent = (contentElement as HTMLElement).offsetParent ?? document.body;
  const contentParentRect = contentParent.getBoundingClientRect();
  const relativePosition = getAbsoluteContentPosition({
    direction,
    placement,
    element: placementReferenceElement,
    align,
    rtl
  });
  const leftOffset = relativePosition.left - contentParentRect.left + contentParent.scrollLeft;
  const topOffset = relativePosition.top - contentParentRect.top + contentParent.scrollTop;
  return { left: leftOffset, top: topOffset };
};

export const getContentPositionString = (params: {
  contentElement: HTMLElement;
  direction: Direction;
  placement: Placement;
  placementReferenceElement: HTMLElement;
  align: Align;
  rtl?: boolean;
}): string => {
  const { contentElement, direction, placement, placementReferenceElement, align, rtl } = params;
  const position = getRelativeContentPosition({
    contentElement,
    direction,
    placement,
    placementReferenceElement,
    align,
    rtl: rtl ?? isRTL()
  });
  return `translate3d(${position.left}px, ${position.top}px, 0px)`;
};

export const responsivelyCheckDirection = (params: {
  isScrolling?: boolean;
  currentDirection: Direction;
  contentElements: HTMLElement[];
  hostElement: HTMLElement | null;
  placement: Placement;
  placementReferenceElement: HTMLElement;
  align: Align;
  responsiveDirectionToPlacement: boolean;
  closeOnPlacementReferenceScrollOut: boolean;
  closeOnContentScrollOut: boolean;
  minSpaceThresholdFactor?: number;
  placementReverse?: Placement;
  rtl?: boolean;
}): { responsiveDirection?: Direction; close: boolean } => {
  const {
    isScrolling,
    currentDirection,
    contentElements,
    hostElement,
    placement,
    placementReferenceElement,
    align,
    responsiveDirectionToPlacement,
    closeOnPlacementReferenceScrollOut,
    closeOnContentScrollOut,
    minSpaceThresholdFactor,
    placementReverse,
    rtl
  } = params;

  const actualRtl = rtl ?? isRTL();

  let responsiveDirection: Direction | undefined;

  const actualCurrentDirection = actualRtl
    ? currentDirection === 'start'
      ? 'end'
      : currentDirection === 'end'
        ? 'start'
        : currentDirection
    : currentDirection;

  // Defines how the properties to access are named in the current axis.
  const currentAxis = currentDirection === 'start' || currentDirection === 'end' ? AXIS_X : AXIS_Y;
  // The combined (enclosing) client rect for all component contents.
  const contentsRect = getCombinedBoundingClientRect(contentElements);
  // The chain of scroll parents of the container host element up to and often including the body, checking for possible overlaps.
  const containerScrollParents = getScrollParentsChain(hostElement, currentAxis.axis);
  const containerScrollParentRects = containerScrollParents.map(item =>
    item.getBoundingClientRect()
  );
  // The biggest upper bound (top, left) of all scroll parents (and viewport = 0), the point before which content will be cut off.
  const scrollParentsUpperBound = Math.max(
    0,
    ...containerScrollParentRects.map(item => item[currentAxis.upperBound])
  );
  // The smallest lower bound (bottom, right) of all scroll parents (and viewport), the point after which content will be cut off.
  const scrollParentsLowerBound = Math.min(
    window[currentAxis.windowSize],
    ...containerScrollParentRects.map(item => item[currentAxis.lowerBound])
  );

  // The point from which the component will be opened if opening in regular / scroll (down, end) direction.
  // Influenced by `componentPlacementReference`, `componentPlacement` and `componentAlign`.
  const positionRegular = getAbsoluteContentPosition({
    direction: currentAxis.directionRegular,
    placement,
    element: placementReferenceElement,
    align
  });
  // The point from which the component will be opened if opening in reverse (up, start) direction.
  // Influenced by `componentPlacementReference`, `componentPlacement` and `componentAlign`.
  const positionReverse = getAbsoluteContentPosition({
    direction: currentAxis.directionReverse,
    placement: placementReverse ?? placement,
    element: placementReferenceElement,
    align
  });

  // The enclosing size (height, width) of all contents combined
  const contentsSize = contentsRect[currentAxis.lowerBound] - contentsRect[currentAxis.upperBound];

  // A number showing how many visible pixels would be available in regular / scroll (down, end) direction
  const spaceRegular = scrollParentsLowerBound - positionRegular[currentAxis.upperBound];
  // A number showing how many visible pixels would be available in reverse (up, start) direction
  const spaceReverse = positionReverse[currentAxis.upperBound] - scrollParentsUpperBound;

  let placementRefBounds: { upper: number; lower: number } | undefined;
  if (spaceReverse < contentsSize && spaceRegular < contentsSize) {
    // If there would not be enough room in both directions, always prefer regular / scroll (down, end) direction,
    // since this way the element can expand and scroll while this cannot happen if there's not enough room in front.
    responsiveDirection = actualRtl ? currentAxis.directionReverse : currentAxis.directionRegular;
  } else if (minSpaceThresholdFactor) {
    const contentsSizeWithThreshold = contentsSize + minSpaceThresholdFactor * contentsSize;
    if (spaceReverse < contentsSizeWithThreshold && spaceRegular < contentsSizeWithThreshold) {
      // If a threshold is set and there would not be enough space including the threshold in both directions
      // use the direction with more space
      if (spaceReverse < spaceRegular) {
        responsiveDirection = currentAxis.directionRegular;
      } else {
        responsiveDirection = currentAxis.directionReverse;
      }
    } else if (spaceReverse < contentsSizeWithThreshold) {
      responsiveDirection = currentAxis.directionRegular;
    } else if (spaceRegular < contentsSizeWithThreshold) {
      responsiveDirection = currentAxis.directionReverse;
    }
  }
  if (!responsiveDirection) {
    if (spaceReverse < contentsSize) {
      responsiveDirection = currentAxis.directionRegular;
    } else if (spaceRegular < contentsSize) {
      responsiveDirection = currentAxis.directionReverse;
    } else {
      if (
        responsiveDirectionToPlacement &&
        placementReferenceElement &&
        hostElement !== placementReferenceElement
      ) {
        placementRefBounds = calculatePlacementRefOuterBounds(
          currentAxis,
          placementReferenceElement
        );
        responsiveDirection = calculateDirectionFromPlacementRef({
          currentAxis,
          positionRegular,
          positionReverse,
          contentSize: contentsSize,
          placementRefBounds,
          currentDirection: actualCurrentDirection,
          rtl: actualRtl
        });
      } else {
        // If there would be enough room in both directions, use the set direction (or the regular one if not set).
        responsiveDirection = actualCurrentDirection;
      }
    }
  }

  let close = false;
  if (isScrolling) {
    // Check if the container host or placement reference is hidden and close the component. (Mostly done when scrolling.)
    if (
      closeOnPlacementReferenceScrollOut &&
      placementReferenceElement &&
      hostElement !== placementReferenceElement
    ) {
      placementRefBounds ??= calculatePlacementRefOuterBounds(
        currentAxis,
        placementReferenceElement
      );
      const placementRefRect = placementReferenceElement.getBoundingClientRect();
      // A number showing how many visible pixels of the placement ref would be shown in reverse (up, start) direction
      const placementRefVisibleTop =
        placementRefRect[currentAxis.lowerBound] - placementRefBounds.upper;
      // A number showing how many visible pixels of the placement ref would be shown in regular / scroll (down, end) direction
      const placementRefVisibleBottom =
        placementRefBounds.lower - placementRefRect[currentAxis.upperBound];
      if (placementRefVisibleTop < 0 || placementRefVisibleBottom < 0) {
        // Close the component if the placement ref is not visible.
        close = true;
      }
    }
    if (!close && closeOnContentScrollOut) {
      // A number showing how many visible pixels would be available the other way if set to regular / scroll (down, end) direction
      const spaceRegularOtherSide =
        scrollParentsLowerBound - positionReverse[currentAxis.upperBound];
      // A number showing how many visible pixels would be available the other way if set to reverse (up, start) direction
      const spaceReverseOtherSide =
        positionRegular[currentAxis.upperBound] - scrollParentsUpperBound;
      if (spaceRegularOtherSide < 0 || spaceReverseOtherSide < 0) {
        // Close the component if there is not enough space even in the other direction.
        close = true;
      }
    }
  }
  responsiveDirection = actualRtl
    ? responsiveDirection === 'start'
      ? 'end'
      : responsiveDirection === 'end'
        ? 'start'
        : responsiveDirection
    : responsiveDirection;
  return { responsiveDirection, close };
};
