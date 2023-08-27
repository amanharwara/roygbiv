import { atom } from "jotai";

export const canvasSizeAtom = atom({
  width: 1280,
  height: 720,
});

export const canvasImageAtom = atom<string>("");

// store image element in atom to use size of image to calculate mesh scale
