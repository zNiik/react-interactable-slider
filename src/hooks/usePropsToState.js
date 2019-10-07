import { useLayoutEffect } from 'react';
import useMergeState from './useMergeState';

const internalProps = {
  currentSnapPoint: 0,
  isDragging: false,
  forceDragEnabled: false,
  responsive: true,
  sliderWidth: 800,
  scrollable: true,
  slides: [],
  snapPoints: []
};

function usePropsToState(props) {
  const [state, setState] = useMergeState(internalProps);

  /**
   * Update props for our slider state
   */
  useLayoutEffect(() => {
    setState({ ...props, forceDragEnabled: props.dragEnabled });
  }, [props]);

  return [state, setState];
}

export default usePropsToState;
