import { Texture } from "pixi.js";

export enum GradientType {
  Linear = "linear",
  Radial = "radial",
}

type Props = {
  stops: Array<number>;
  colors: Array<string>;
  attach?: string;
  height: number;
  width: number;
  type?: GradientType;
  innerCircleRadius?: number;
  outerCircleRadius?: string | number;
};

const canvasElement = document.createElement("canvas");

export function GradientTexture({
  stops,
  colors,
  height,
  width,
  type = GradientType.Linear,
  innerCircleRadius = 0,
  outerCircleRadius = "auto",
}: Props) {
  canvasElement.width = width;
  canvasElement.height = height;

  const context = canvasElement.getContext("2d")!;

  let gradient;
  if (type === GradientType.Linear) {
    gradient = context.createLinearGradient(0, 0, 0, height);
  } else {
    const canvasCenterX = canvasElement.width / 2;
    const canvasCenterY = canvasElement.height / 2;
    const radius =
      outerCircleRadius !== "auto"
        ? Math.abs(Number(outerCircleRadius))
        : Math.sqrt(canvasCenterX ** 2 + canvasCenterY ** 2);
    gradient = context.createRadialGradient(
      canvasCenterX,
      canvasCenterY,
      Math.abs(innerCircleRadius),
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

  const texture = Texture.from(canvasElement);
  texture.update();

  return texture;
}
