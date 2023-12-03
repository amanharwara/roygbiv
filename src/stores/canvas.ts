import { create } from "zustand";

type CanvasStore = {
  width: number;
  height: number;
  setSize: (width: number, height: number) => void;
};
export const useCanvasStore = create<CanvasStore>()((set) => ({
  width: Math.round(window.innerWidth / 1.6),
  height: Math.round(window.innerHeight / 1.6),
  setSize: (width: number, height: number) => {
    set({ width, height });
  },
}));
