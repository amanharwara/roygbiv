import { produce } from "immer";
import { nanoid } from "nanoid";
import { DropPosition } from "react-aria-components";
import { create } from "zustand";
import { useCanvasStore } from "./canvas";
import { GradientType } from "@react-three/drei";
import {
  getRandomColors,
  getStopsForGradientColors,
} from "../utils/gradientUtils";

export type ComputedProperty = {
  default: number;
  value: string;
  min?: number;
  max?: number;
};

export function isComputedProperty(value: unknown): value is ComputedProperty {
  return (
    typeof value === "object" &&
    value !== null &&
    "default" in value &&
    "value" in value
  );
}

type CommonLayerProps = {
  id: string;
  name: string;
};

export type CommonPlaneObjectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: ComputedProperty;
  opacity: ComputedProperty;
};

export type ImageLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "image";
    image: HTMLImageElement;
    zoom: ComputedProperty;
    effects: {
      noise: {
        enabled: boolean;
        premultiply: boolean;
        opacity: ComputedProperty;
      };
      pixelate: {
        enabled: boolean;
        granularity: ComputedProperty;
      };
      scanlines: {
        enabled: boolean;
        density: ComputedProperty;
      };
    };
  };

export type GradientLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "gradient";
    gradientType: GradientType;
    stops: number[];
    colors: string[];
  };

export type PlaneLayer = ImageLayer | GradientLayer;

export type Layer = ImageLayer | GradientLayer;

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
  updateLayerComputedProperty: (
    layerId: string,
    key: string,
    value: string,
  ) => void;

  removeSelectedLayer: () => void;

  addImageLayer: (image: HTMLImageElement, name: string) => void;

  addGradientLayer: () => void;
  addColorToGradientLayer: (layerId: string, color: string) => void;
  updateColorInGradientLayer: (
    layerId: string,
    colorIndex: number,
    color: string,
  ) => void;
  removeColorFromGradientLayer: (layerId: string, index: number) => void;
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
        const selectedLayerIndex = state.layers.findIndex(
          (layer) => layer.id === state.selectedLayerId,
        );
        if (selectedLayerIndex === -1) {
          return;
        }
        state.layers.splice(selectedLayerIndex, 1);
        const previousLayer = state.layers[Math.max(selectedLayerIndex - 1, 0)];
        if (previousLayer) {
          state.selectedLayerId = previousLayer.id;
        } else {
          state.selectedLayerId = null;
        }
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
  updateLayerComputedProperty: (
    layerId: string,
    key: string,
    value: string,
  ) => {
    set(
      produce((state: LayerStore) => {
        const index = state.layers.findIndex((layer) => layer.id === layerId);
        if (index === -1) {
          return;
        }
        const currentLayer = state.layers[index]!;
        const property = currentLayer[key as keyof Layer];
        if (!isComputedProperty(property)) {
          console.error("Tried to update a non-computed property as computed");
          return;
        }
        property.value = value;
      }),
    );
  },
  addColorToGradientLayer: (layerId: string, color: string) => {
    set(
      produce((state: LayerStore) => {
        const index = state.layers.findIndex((layer) => layer.id === layerId);
        if (index === -1) {
          return;
        }
        const currentLayer = state.layers[index]!;
        if (currentLayer.type !== "gradient") {
          return;
        }
        const colors = [...currentLayer.colors, color];
        state.layers[index] = {
          ...currentLayer,
          colors,
          stops: getStopsForGradientColors(colors),
        };
      }),
    );
  },
  updateColorInGradientLayer: (
    layerId: string,
    colorIndex: number,
    color: string,
  ) => {
    set(
      produce((state: LayerStore) => {
        const layerIndex = state.layers.findIndex(
          (layer) => layer.id === layerId,
        );
        if (layerIndex === -1) {
          return;
        }
        const layer = state.layers[layerIndex]!;
        if (layer.type !== "gradient") {
          return;
        }
        const colors = [...layer.colors];
        colors[colorIndex] = color;
        state.layers[layerIndex] = {
          ...layer,
          colors,
          stops: getStopsForGradientColors(colors),
        };
      }),
    );
  },
  removeColorFromGradientLayer: (layerId: string, colorIndex: number) => {
    set(
      produce((state: LayerStore) => {
        const layerIndex = state.layers.findIndex(
          (layer) => layer.id === layerId,
        );
        if (layerIndex === -1) {
          return;
        }
        const layer = state.layers[layerIndex]!;
        if (layer.type !== "gradient") {
          return;
        }
        const colors = [...layer.colors];
        const lengthAfterRemoval = colors.length - 1;
        if (lengthAfterRemoval < 2) {
          return;
        }
        colors.splice(colorIndex, 1);
        state.layers[layerIndex] = {
          ...layer,
          colors,
          stops: getStopsForGradientColors(colors),
        };
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
    zoom: {
      default: 1,
      value: "1",
      min: 0,
      max: 5,
    },
    scale: {
      default: 1,
      value: "1",
      min: 0,
    },
    opacity: {
      default: 1,
      value: "1",
      min: 0,
      max: 1,
    },
    name,
    id: nanoid(),
    effects: {
      noise: {
        enabled: false,
        premultiply: false,
        opacity: {
          default: 0.5,
          value: "0.5",
          min: 0,
          max: 1,
        },
      },
      pixelate: {
        enabled: false,
        granularity: {
          default: 30,
          value: "30",
          min: 1,
          max: 100,
        },
      },
      scanlines: {
        enabled: false,
        density: {
          default: 1.25,
          value: "1.25",
          min: 0,
          max: 2,
        },
      },
    },
  };
};

const createGradientLayer = (): GradientLayer => {
  return {
    type: "gradient",
    gradientType: GradientType.Linear,
    x: 0,
    y: 0,
    width: useCanvasStore.getState().width,
    height: useCanvasStore.getState().height,
    scale: {
      default: 1,
      value: "1",
      min: 0,
      max: 1,
    },
    opacity: {
      default: 1,
      value: "1",
      min: 0,
      max: 1,
    },
    stops: [0, 1],
    colors: getRandomColors(2),
    name: "Gradient",
    id: nanoid(),
  };
};
