import { produce } from "immer";
import { nanoid } from "nanoid";
import { DropPosition, Key } from "react-aria-components";
import { create } from "zustand";
import { useCanvasStore } from "./canvas";
import {
  getDynamicStopsForGradientColors,
  getRandomColors,
  getStopsForGradientColors,
} from "../utils/gradientUtils";
import { GradientType } from "../textures/GradientTexture";

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

type NoiseEffect = {
  enabled: boolean;
  amount: ComputedProperty;
};

type AsciiEffect = {
  enabled: boolean;
  size: ComputedProperty;
  color: string;
  replaceColor: boolean;
};

export type CommonPlaneObjectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  maintainAspect: boolean;
  scale: ComputedProperty;
  opacity: ComputedProperty;
  centered: boolean;
  effects: {
    noise: NoiseEffect;
    ascii: AsciiEffect;
  };
};

export type ImageLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "image";
    image: HTMLImageElement;
  };

export type GradientLayer = CommonLayerProps &
  CommonPlaneObjectProps & {
    type: "gradient";
    gradientType: GradientType;
    useDynamicStops: boolean;
    stops: number[];
    dynamicStops: ComputedProperty[];
    colors: string[];
  };

export type PlaneLayer = ImageLayer | GradientLayer;

export type Layer = ImageLayer | GradientLayer;

type LayerStore = {
  selectedLayerIDs: Key[];
  setSelectedLayerIDs: (selectedLayerIDs: Key[]) => void;
  selectAllLayers: () => void;

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

  removeSelectedLayers: () => void;

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
  selectedLayerIDs: [],
  setSelectedLayerIDs: (selectedLayerIDs: Key[]) => {
    set({ selectedLayerIDs });
  },
  selectAllLayers: () => {
    set(
      produce((state: LayerStore) => {
        state.selectedLayerIDs = state.layers.map((layer) => layer.id);
      }),
    );
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
        state.selectedLayerIDs = [imageLayer.id];
      }),
    );
  },
  addGradientLayer: () => {
    set(
      produce((state: LayerStore) => {
        const gradientLayer = createGradientLayer();
        state.layers.unshift(gradientLayer);
        state.selectedLayerIDs = [gradientLayer.id];
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
  removeSelectedLayers: () => {
    set(
      produce((state: LayerStore) => {
        state.layers = state.layers.filter(
          (layer) => !state.selectedLayerIDs.includes(layer.id),
        );
        const firstLayer = state.layers[0];
        if (firstLayer) {
          state.selectedLayerIDs = [firstLayer.id];
        } else {
          state.selectedLayerIDs = [];
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

const createNoiseEffect = (): NoiseEffect => {
  return {
    enabled: false,
    amount: {
      default: 0.5,
      value: "0.5",
      min: 0,
      max: 1,
    },
  };
};

const createAsciiEffect = (): AsciiEffect => {
  return {
    enabled: false,
    size: {
      default: 10,
      value: "10",
      min: 2,
      max: 20,
    },
    color: "#ffffff",
    replaceColor: false,
  };
};

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
    maintainAspect: true,
    centered: true,
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
      noise: createNoiseEffect(),
      ascii: createAsciiEffect(),
    },
  };
};

const createGradientLayer = (): GradientLayer => {
  const colors = getRandomColors(2);
  const stops = getStopsForGradientColors(colors);
  const dynamicStops = getDynamicStopsForGradientColors(colors);

  return {
    type: "gradient",
    gradientType: GradientType.Linear,
    x: 0,
    y: 0,
    width: useCanvasStore.getState().width,
    height: useCanvasStore.getState().height,
    maintainAspect: true,
    centered: true,
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
    colors,
    useDynamicStops: false,
    stops,
    dynamicStops,
    name: "Gradient",
    id: nanoid(),
    effects: {
      noise: createNoiseEffect(),
      ascii: createAsciiEffect(),
    },
  };
};
