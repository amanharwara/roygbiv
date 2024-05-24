import { Application } from "pixi.js";
import { create } from "zustand";
import { fps } from "../constants";

type CanvasStore = {
  width: number;
  height: number;
  setSize: (width: number, height: number) => void;

  isRendering: boolean;
  setIsRendering: (isRendering: boolean) => void;

  pixiApp: Application | null;
  setPixiApp: (pixiApp: Application) => void;
};
export const useCanvasStore = create<CanvasStore>()((set) => ({
  width: Math.round(window.innerWidth / 1.6),
  height: Math.round(window.innerHeight / 1.6),
  setSize: (width: number, height: number) => {
    set({ width, height });
  },

  isRendering: false,
  setIsRendering: (isRendering: boolean) => {
    set({
      isRendering,
    });
  },

  pixiApp: null,
  setPixiApp: (pixiApp: Application) => {
    pixiApp.ticker.maxFPS = fps;
    set({ pixiApp });
  },
}));
