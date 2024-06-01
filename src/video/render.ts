import { FFmpeg } from "@ffmpeg/ffmpeg";
import ffMpegCoreWorker from "../ffmpeg-js/ffmpeg-core.worker?url";
import { didAudioEnd, playAudio, resetAudio } from "../audio/context";
import { useCanvasStore } from "../stores/canvas";
import { concatenateUint8Arrays } from "../utils/concatenateUint8Arrays";
import { fps } from "../constants";

let isRendering = false;
let canvas: HTMLCanvasElement | null = null;
let encodeInterval: number | null = null;

let videoEncoder: VideoEncoder | null = null;
const chunks: Uint8Array[] = [];
function handleChunk(chunk: EncodedVideoChunk) {
  let chunkData: Uint8Array | null = new Uint8Array(chunk.byteLength);
  chunk.copyTo(chunkData);
  chunks.push(chunkData);
  chunkData = null;
}

let framesGenerated = 0;
let startTime: number | null = null;
let lastKeyFrame: number | null = null;

const ffmpeg = new FFmpeg();
const ffmpegBaseUrl = new URL("../ffmpeg-js", import.meta.url).href;
ffmpeg.on("log", ({ type, message }) => {
  console.log(type, message);
});
ffmpeg.on("progress", ({ progress, time }) => {
  console.log(progress, time);
});
if (!ffmpeg.loaded) {
  ffmpeg
    .load({
      coreURL: `${ffmpegBaseUrl}/ffmpeg-core.js`,
      wasmURL: `${ffmpegBaseUrl}/ffmpeg-core.wasm`,
      workerURL: ffMpegCoreWorker,
    })
    .then((loaded) => {
      useCanvasStore.getState().setIsFFmpegReady(loaded);
    });
}

export function startRendering() {
  const pixiApp = useCanvasStore.getState().pixiApp;
  if (!pixiApp) return;

  canvas = pixiApp.view as HTMLCanvasElement;

  const evenedWidth = canvas.width % 2 === 0 ? canvas.width : canvas.width + 1;
  const evenedHeight =
    canvas.height % 2 === 0 ? canvas.height : canvas.height + 1;

  videoEncoder = new VideoEncoder({
    output: handleChunk,
    error: (e) => console.error(e),
  });
  videoEncoder.configure({
    codec: "avc1.640034", // avc1.42001E / avc1.4d002a / avc1.640034
    avc: { format: "annexb" },
    width: evenedWidth,
    height: evenedHeight,
    bitrate: 9_000_000, // 9 Mbps
    framerate: fps,
    bitrateMode: "constant",
  });

  isRendering = true;
  useCanvasStore.getState().setIsRendering(true);
  framesGenerated = 0;
  startTime = document.timeline.currentTime as number;
  lastKeyFrame = -Infinity;

  resetAudio();
  playAudio();
  encodeInterval = window.setInterval(renderFrame, 1000 / 60);
}

async function finishRendering(finalFrames: Uint8Array) {
  const containerName = "composed.h264";
  const outputName = "output.mp4";
  await ffmpeg.writeFile(containerName, finalFrames);
  await ffmpeg.exec([
    "-i",
    `${containerName}`,
    "-map",
    "0:v:0",
    "-c:v",
    "copy",
    "-y",
    `${outputName}`,
  ]);
  const muxedBytes = await ffmpeg.readFile(outputName);
  console.log(muxedBytes);
}

export function stopRendering() {
  isRendering = false;
  useCanvasStore.getState().setIsRendering(false);
  if (encodeInterval) {
    window.clearInterval(encodeInterval);
    encodeInterval = null;
  }

  if (videoEncoder) {
    videoEncoder.flush();
    videoEncoder = null;
  }

  const final = concatenateUint8Arrays(chunks);
  finishRendering(final).catch(console.error);
}

const renderFrame = () => {
  if (!isRendering) return;

  if (didAudioEnd()) {
    stopRendering();
    return;
  }

  const pixiApp = useCanvasStore.getState().pixiApp;
  if (!pixiApp) {
    stopRendering();
    throw new Error("Pixi app is not initialized");
  }
  const canvas = pixiApp.view as HTMLCanvasElement;
  pixiApp.ticker.update();
  pixiApp.renderer.render(pixiApp.stage);

  const frame = new VideoFrame(canvas, {
    timestamp: framesGenerated * (1 / 60),
    duration: 1e6 / 60,
  });
  framesGenerated++;

  let elapsedTime = (document.timeline.currentTime as number) - startTime!;

  let needsKeyFrame = elapsedTime - lastKeyFrame! >= 5000;
  if (needsKeyFrame) {
    lastKeyFrame = elapsedTime;
  }

  videoEncoder!.encode(frame, {
    keyFrame: needsKeyFrame,
  });
  frame.close();
};
