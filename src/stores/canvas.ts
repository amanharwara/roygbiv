import { create } from "zustand";

type CanvasStore = {
  width: number;
  height: number;
  setSize: (width: number, height: number) => void;
};
export const useCanvasStore = create<CanvasStore>()((set) => ({
  width: 1280,
  height: 800,
  setSize: (width: number, height: number) => {
    set({ width, height });
  },
}));
