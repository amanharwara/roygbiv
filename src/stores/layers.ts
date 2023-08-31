import { PrimitiveAtom, atom } from "jotai";

type CommonLayerProps = {
  type: "image";
};

export type ImageLayer = CommonLayerProps & {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  opacity: number;
  name: string;
};

export type Layer = ImageLayer;

export const selectedLayerAtom = atom<PrimitiveAtom<Layer> | null>(null);

export const layersAtom = atom<PrimitiveAtom<Layer>[]>([]);

export const createImageLayer = (image: HTMLImageElement, name: string) => {
  return atom<ImageLayer>({
    type: "image",
    image,
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
    zoom: 1,
    opacity: 1,
    name,
  });
};
