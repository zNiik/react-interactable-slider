import React, { useState } from "react";
import useMergeState from "./hooks/useMergeState";

import ReactInteractableSlider from "../../dist";
import Debugger from "./components/Debugger";

import LeftArrow from "./components/Arrows/LeftArrow";
import RightArrow from "./components/Arrows/RightArrow";
import ProductCard from "./components/ProductCard";

function App() {
  const slider = useMergeState({
    cellAlign: "left",
    debug: false,
    dragEnabled: true,
    fullWidthPerSlide: false,
    marginGapsPerSlide: 4,
    navigationType: "both",
    widthPerSlide: 180
  });

  const [slides, setSlides] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [count, setCount] = useState(0);
  const [state, setState] = slider;

  const addSlide = () => setSlides([...slides, slides.length]);

  const removeSlide = () => setSlides(slides.slice(0, -1));

  const incrementCount = () => setCount(count + 1);

  const toggleCustomArrows = () => {
    setState(
      state.customArrows
        ? { customArrows: null }
        : {
            customArrows: {
              left: <LeftArrow />,
              right: <RightArrow />
            }
          }
    );
  };

  return (
    <>
      <button onClick={addSlide}>Add Slide</button>{" "}
      <button onClick={removeSlide} data-testid="btn-remove-slide">
        Remove Slide
      </button>
      <br />
      <br />
      <button onClick={incrementCount}>Increment Count</button>{" "}
      <button onClick={toggleCustomArrows}>Toggle Custom Arrows</button>
      <div>&nbsp;</div>
      <div>
        Increment count (Making sure that the slider doesn't go back to slide 1
        when state from the parent component changes): <b>{count}</b>
      </div>
      <div>&nbsp;</div>
      <ReactInteractableSlider {...slider[0]}>
        {slides.map(v => (
          <ProductCard fullWidthPerSlide={state.fullWidthPerSlide} key={v} />
        ))}
      </ReactInteractableSlider>
      <Debugger slider={slider} />
    </>
  );
}

export default App;
