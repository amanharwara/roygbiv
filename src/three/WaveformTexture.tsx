import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getTimeDomainData, useAudioStore } from "../stores/audio";
import { CanvasTexture } from "three";

export function WaveformTexture() {
  const gl = useThree((state) => state.gl);

  const ref = useRef<CanvasTexture>(null);

  const canvasElement = useRef<HTMLCanvasElement>(
    document.createElement("canvas"),
  );

  const isPlaying = useAudioStore((state) => state.isPlaying);

  useEffect(() => {
    let animationFrameId: number;

    const updateCanvas = () => {
      if (!isPlaying) return;

      const canvas = canvasElement.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const timeDomainData = getTimeDomainData();

      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();

      ctx.moveTo(0, height / 2);

      const sliceWidth = (width * 1.0) / timeDomainData.length;

      let x = 0;

      for (const sample of timeDomainData) {
        const y = (sample / 255.0) * height;
        ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);

      ctx.strokeStyle = "#ffffff";

      ctx.stroke();

      ref.current!.needsUpdate = true;

      animationFrameId = requestAnimationFrame(updateCanvas);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateCanvas);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvasTexture
      ref={ref}
      colorSpace={gl.outputColorSpace}
      args={[canvasElement.current]}
      attach="map"
    />
  );
}
