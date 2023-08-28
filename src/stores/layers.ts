import { atom } from "jotai";

type ImageLayer = {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
};

type Layer = ImageLayer;

export const layersAtom = atom<Layer[]>([]);

export const createImageLayer = (image: HTMLImageElement) => {
  return atom<ImageLayer>({
    image,
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
    opacity: 1,
  });
};
