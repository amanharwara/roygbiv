import { produce } from "immer";
import { nanoid } from "nanoid";
import { DropPosition } from "react-aria-components";
import { create } from "zustand";
import { useCanvasStore } from "./canvas";

type CommonLayerProps = {
  id: string;
  name: string;
};

export type CommonPlaneObjectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  opacity: number;
};

export type ImageLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "image";
    image: HTMLImageElement;
  };

export type AsciiEffectLayer = CommonLayerProps & {
  type: "ascii";
  bgColor: string;
  fgColor: string;
  invert: boolean;
  resolution: number;
};

export type GradientLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "gradient";
    stops: number[];
    colors: string[];
  };

export type PlaneLayer = ImageLayer | GradientLayer;
export type Layer = ImageLayer | GradientLayer | AsciiEffectLayer;

type LayerStore = {
  selectedLayerId: string | null;
  setSelectedLayerId: (selectedLayerId: string | null) => void;
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  removeLayer: (layerId: string) => void;
  moveLayer: (
    position: DropPosition,
    targetId: string,
    draggedId: string,
  ) => void;
  updateLayer: <_Layer extends Layer>(
    layerId: string,
    layer: Partial<_Layer>,
  ) => void;
  removeSelectedLayer: () => void;
  addImageLayer: (image: HTMLImageElement, name: string) => void;
  addGradientLayer: () => void;
  addAsciiEffectLayer: () => void;
};
export const useLayerStore = create<LayerStore>()((set) => ({
  selectedLayerId: null,
  setSelectedLayerId: (selectedLayerId: string | null) => {
    set({ selectedLayerId });
  },
  layers: [],
  setLayers: (layers: Layer[]) => {
    set({ layers });
  },
  addImageLayer: (image: HTMLImageElement, name: string) => {
    set(
      produce((state: LayerStore) => {
        const imageLayer = createImageLayer(image, name);
        state.layers.unshift(imageLayer);
        state.selectedLayerId = imageLayer.id;
      }),
    );
  },
  addGradientLayer: () => {
    set(
      produce((state: LayerStore) => {
        const gradientLayer = createGradientLayer();
        state.layers.unshift(gradientLayer);
        state.selectedLayerId = gradientLayer.id;
      }),
    );
  },
  addAsciiEffectLayer: () => {
    set(
      produce((state: LayerStore) => {
        const asciiEffectLayer = createAsciiEffectLayer();
        state.layers.unshift(asciiEffectLayer);
        state.selectedLayerId = asciiEffectLayer.id;
      }),
    );
  },
  removeLayer: (layerId: string) => {
    set(
      produce((state: LayerStore) => {
        state.layers = state.layers.filter((layer) => layer.id !== layerId);
      }),
    );
  },
  removeSelectedLayer: () => {
    set(
      produce((state: LayerStore) => {
        state.layers = state.layers.filter(
          (layer) => layer.id !== state.selectedLayerId,
        );
        state.selectedLayerId = null;
      }),
    );
  },
  moveLayer: (position: DropPosition, targetId: string, draggedId: string) => {
    if (position === "on") {
      return;
    }
    set(
      produce((state: LayerStore) => {
        const targetIndex = state.layers.findIndex(
          (layer) => layer.id === targetId,
        );
        const draggedIndex = state.layers.findIndex(
          (layer) => layer.id === draggedId,
        );
        if (targetIndex === -1 || draggedIndex === -1) {
          return;
        }
        state.layers.splice(
          targetIndex,
          0,
          state.layers.splice(draggedIndex, 1)[0]!,
        );
      }),
    );
  },
  updateLayer: <_Layer extends Layer>(
    layerId: string,
    layer: Partial<_Layer>,
  ) => {
    set(
      produce((state: LayerStore) => {
        const index = state.layers.findIndex((layer) => layer.id === layerId);
        if (index === -1) {
          return;
        }
        const currentLayer = state.layers[index]!;
        state.layers[index] = { ...currentLayer, ...layer };
      }),
    );
  },
}));

const createImageLayer = (
  image: HTMLImageElement,
  name: string,
): ImageLayer => {
  return {
    type: "image",
    image,
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
    zoom: 1,
    opacity: 1,
    name,
    id: nanoid(),
  };
};

const createGradientLayer = (): GradientLayer => {
  return {
    type: "gradient",
    x: 0,
    y: 0,
    width: useCanvasStore.getState().width,
    height: useCanvasStore.getState().height,
    zoom: 1,
    opacity: 1,
    stops: [0, 1],
    colors: ["aquamarine", "hotpink"],
    name: "Gradient",
    id: nanoid(),
  };
};

const createAsciiEffectLayer = (): AsciiEffectLayer => {
  return {
    type: "ascii",
    bgColor: "#000000",
    fgColor: "#ffffff",
    invert: true,
    resolution: 0.15,
    name: "ASCII Effect",
    id: nanoid(),
  };
};
