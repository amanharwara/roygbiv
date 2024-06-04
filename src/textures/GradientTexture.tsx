import { Texture } from "pixi.js";

export enum GradientType {
  Linear = "linear",
  Radial = "radial",
}

type GradientProperties = {
  stops: Array<number>;
  colors: Array<string>;
  attach?: string;
  type?: GradientType;
};

type InitProperties = {
  id: string;
  height: number;
  width: number;
} & GradientProperties;

const canvasCache = new Map<string, HTMLCanvasElement>();

function getCanvasElement(id: string): HTMLCanvasElement {
  let canvasElement = canvasCache.get(id);

  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasCache.set(id, canvasElement);
  }

  return canvasElement;
}

export function createGradientTexture({
  id,
  width,
  height,
  ...gradientProperties
}: InitProperties) {
  const canvasElement = getCanvasElement(id);

  canvasElement.width = width;
  canvasElement.height = height;

  const texture = Texture.from(canvasElement);

  function update({ stops, colors, type }: GradientProperties) {
    const context = canvasElement.getContext("2d")!;

    let gradient;
    if (type === GradientType.Linear) {
      gradient = context.createLinearGradient(0, 0, 0, height);
    } else {
      const canvasCenterX = canvasElement.width / 2;
      const canvasCenterY = canvasElement.height / 2;
      const radius = Math.sqrt(canvasCenterX ** 2 + canvasCenterY ** 2);
      gradient = context.createRadialGradient(
        canvasCenterX,
        canvasCenterY,
        0,
        canvasCenterX,
        canvasCenterY,
        radius,
      );
    }

    let i = stops.length;
    while (i--) {
      gradient.addColorStop(stops[i]!, colors[i]!);
    }

    context.save();
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.restore();

    texture.update();
  }

  function destroy() {
    texture.destroy();
    canvasCache.delete(id);
  }

  update(gradientProperties);

  return {
    texture,
    update,
    destroy,
  };
}
