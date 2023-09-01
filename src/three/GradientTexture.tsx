import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { CanvasTexture } from "three";

export enum GradientType {
  Linear = "linear",
  Radial = "radial",
}

type Props = {
  stops: Array<number>;
  colors: Array<string>;
  attach?: string;
  size?: number;
  width?: number;
  type?: GradientType;
  innerCircleRadius?: number;
  outerCircleRadius?: string | number;
} & Omit<JSX.IntrinsicElements["texture"], "ref">;

export function GradientTexture({
  stops,
  colors,
  size = 1024,
  width = 16,
  //@ts-expect-error - weird error about type never, although the type is clearly defined
  type = GradientType.Linear,
  innerCircleRadius = 0,
  outerCircleRadius = "auto",
  ...props
}: Props) {
  const gl = useThree((state) => state.gl);

  const ref = useRef<CanvasTexture>(null);

  const canvasElement = useRef<HTMLCanvasElement>(
    document.createElement("canvas"),
  );

  useEffect(() => {
    const context = canvasElement.current.getContext("2d")!;
    canvasElement.current.width = width;
    canvasElement.current.height = size;

    let gradient;
    if (type === GradientType.Linear) {
      gradient = context.createLinearGradient(0, 0, 0, size);
    } else {
      const canvasCenterX = canvasElement.current.width / 2;
      const canvasCenterY = canvasElement.current.height / 2;
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
    context.fillRect(0, 0, width, size);
    context.restore();

    ref.current!.needsUpdate = true;
  }, [colors, innerCircleRadius, outerCircleRadius, size, stops, type, width]);

  return (
    <canvasTexture
      ref={ref}
      colorSpace={gl.outputColorSpace}
      // @ts-expect-error - weird error about type never, although the type is clearly defined
      args={[canvasElement.current]}
      attach="map"
      {...props}
    />
  );
}
