import { atom } from "jotai";

export const canvasSizeAtom = atom({
  width: 1280,
  height: 800,
});

export const canvasImageAtom = atom(new Image());

// store image element in atom to use size of image to calculate mesh scale
