import { PrimitiveAtom, atom } from "jotai";

export type ImageLayer = {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  name: string;
};

export type Layer = ImageLayer;

export const selectedLayerAtom = atom<PrimitiveAtom<Layer> | null>(null);

export const layersAtom = atom<PrimitiveAtom<Layer>[]>([]);

export const createImageLayer = (image: HTMLImageElement, name: string) => {
  return atom<ImageLayer>({
    image,
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
    opacity: 1,
    name,
  });
};
