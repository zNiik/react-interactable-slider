import React, { useContext, useMemo, useRef } from 'react';
import { useDidUpdate } from 'react-hooks-lib';
import { container, containerInner } from './styles';
import useDimensions from '../../hooks/useDimensions';
import Context from '../../context';
import Navigation from '../Navigation';
import usePreventDragConflicts from '../../hooks/usePreventDragConflicts';

function Container({ children }) {
  const [state, setState] = useContext(Context);
  const containerRef = useRef();

  const { cellAlign, debug, responsive, sliderWidth, snapPoints } = state;
  const direction = cellAlign === 'left' ? 'ltr' : 'rtl';

  const containerClass = useMemo(() => container(state), [debug]);
  const containerInnerClass = useMemo(() => containerInner(state), [cellAlign, debug, snapPoints]);
  const memoizedWidth = useMemo(() => (!responsive ? parseInt(sliderWidth) : '100%'));

  const [ref, dimensions] = useDimensions(responsive);

  usePreventDragConflicts(containerRef);

  /**
   * We wrap it using useDidUpdate because we want to get
   * the value after the DOM loads
   */
  useDidUpdate(() => {
    const { width } = dimensions;
    setState({ sliderWidth: responsive ? width : sliderWidth });
  }, [dimensions]);

  return (
    <div ref={ref} style={{ width: memoizedWidth }} className={containerClass} dir={direction}>
      <div ref={containerRef} className={containerInnerClass}>
        {children}
      </div>
      <Navigation />
    </div>
  );
}

export default Container;
