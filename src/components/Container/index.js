import React, { useMemo, useRef, useCallback } from 'react';
import ZingTouch from 'zingtouch';
import { useDidUpdate } from 'react-hooks-lib';
import { container, containerInner } from './styles';
import useDimensions from '../../hooks/useDimensions';
import useAppContext from '../../context';
import Navigation from '../Navigation';
import usePreventDragConflicts from '../../hooks/usePreventDragConflicts';
import usePreventEvtOuside from '../../hooks/usePreventEvtOutside';
import useEventListener from '../../hooks/useEventListener';

let interactionStart,
  panStarted = false,
  threshold = 4,
  pannedDirection = null;

function Container({ children }) {
  const {
    propsToState: [state, setState],
    userProps,
  } = useAppContext();

  const containerRef = useRef();

  const {
    cellAlign,
    isDragging,
    debug,
    fullWidthPerSlide,
    navigationType,
    responsive,
    sliderWidth,
    snapPoints,
  } = state;

  const direction = cellAlign === 'left' ? 'ltr' : 'rtl';

  const containerClass = useMemo(() => container(state), [debug]);
  const containerInnerClass = useMemo(() => containerInner(state), [cellAlign, debug, snapPoints]);
  const memoizedWidth = useMemo(() => ({ width: !responsive ? parseInt(sliderWidth) : '100%' }), [
    sliderWidth,
  ]);

  const [ref, dimensions] = useDimensions(responsive);

  usePreventDragConflicts(containerRef);

  // The element for the react native interactable
  const el = containerRef.current && containerRef.current.firstChild;

  const hasSnapPoints = snapPoints.length > 0;

  // We want to be able to force the dragEnabled state
  // depending on the config of the user
  const canDrag = userProps.dragEnabled && hasSnapPoints;

  const disableDrag = useCallback((dragEnabled = false) => setState({ dragEnabled }), [setState]);

  // prevent click if user is still dragging
  useEventListener('click', e => isDragging && e.preventDefault(), el);

  /**
   * Creating mobile touch behavior
   * 1. When user starts dragging the slider the scroll should be disabled
   * 2. When user starts scrolling the dragging of the slider should be disabled
   */
  usePreventEvtOuside(el, 'touchstart', e => {
    disableDrag();
    panStarted = true;
    interactionStart = +new Date();
  });

  useEventListener('touchend', () => {
    pannedDirection = null;
    panStarted = false;
    interactionStart = null;
  });

  // Disable touch scroll depending below condition
  useEventListener(
    'touchmove',
    e => {
      if (interactionStart) {
        const delta = +new Date() - interactionStart;
        if (delta > threshold) {
          if (pannedDirection === 'right' || pannedDirection === 'left') {
            e.preventDefault();
            disableDrag(canDrag);
          }
        }
      }
    },
    window,
    { passive: false }
  );

  const handler = useCallback(
    e => {
      if (!panStarted) {
        return;
      }

      let angle = e.detail.data[0].directionFromOrigin;

      if ((angle >= 315 && angle <= 360) || (angle <= 45 && angle >= 0)) {
        pannedDirection = 'right';
      } else if (angle >= 135 && angle <= 225) {
        pannedDirection = 'left';
      } else {
        disableDrag();
        pannedDirection = angle <= 135 ? 'up' : 'down';
      }

      panStarted = false;
    },
    [disableDrag]
  );

  useDidUpdate(() => {
    const region = new ZingTouch.Region(el, true, false);
    region.bind(el, 'pan', handler);
    return () => region.unbind(el, 'pan', handler);
  }, [el]);

  /**
   * We wrap it using useDidUpdate because we want to get
   * the value after the DOM loads
   */
  useDidUpdate(() => {
    const { width } = dimensions;
    setState({ sliderWidth: responsive ? width : sliderWidth });
  }, [dimensions, fullWidthPerSlide]);

  return (
    <div
      ref={ref}
      style={memoizedWidth}
      className={containerClass}
      dir={direction}
      data-testid="carousel-container"
    >
      <div ref={containerRef} className={containerInnerClass}>
        {children}
      </div>

      {/* Avoid unnecessary rendering of Navigation */}
      {hasSnapPoints && navigationType !== 'none' && <Navigation />}
    </div>
  );
}

export default Container;
