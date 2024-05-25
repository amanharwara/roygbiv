import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { useCanvasStore } from "../stores/canvas";
import { didAudioEnd, playAudio, resetAudio } from "../audio/context";

let muxer: Muxer<ArrayBufferTarget> | null = null;
let videoEncoder: VideoEncoder | null = null;
let isRendering = false;
let framesGenerated = 0;
let encodeInterval: number | null = null;
let fileHandle: FileSystemFileHandle | null = null;
let startTime: number | null = null;
let lastKeyFrame: number | null = null;

export async function startRendering() {
  fileHandle = await window.showSaveFilePicker({
    types: [
      {
        description: "MP4 file",
        accept: {
          "video/mp4": [".mp4"],
        },
      },
    ],
  });

  useCanvasStore.getState().setIsRendering(true);
  resetAudio();

  const pixiApp = useCanvasStore.getState().pixiApp;

  const canvas = pixiApp!.view;
  const evenedWidth = canvas.width % 2 === 0 ? canvas.width : canvas.width + 1;
  const evenedHeight =
    canvas.height % 2 === 0 ? canvas.height : canvas.height + 1;

  isRendering = true;
  framesGenerated = 0;
  startTime = document.timeline.currentTime as number;
  lastKeyFrame = -Infinity;

  muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: "avc",
      width: evenedWidth,
      height: evenedHeight,
    },
    fastStart: "in-memory",
  });

  videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer!.addVideoChunk(chunk, meta);
    },
    error: (e) => console.error(e),
  });
  videoEncoder.configure({
    codec: "avc1.42001f",
    width: evenedWidth,
    height: evenedHeight,
    bitrate: 1e7,
  });

  playAudio();
  encodeVideoFrame();
  encodeInterval = window.setInterval(encodeVideoFrame, 1000 / 60);
}

function stopAndResetRendering() {
  clearInterval(encodeInterval!);
  useCanvasStore.getState().setIsRendering(false);
  resetAudio();
  muxer = null;
  videoEncoder = null;
  isRendering = false;
}

export async function finishRendering() {
  if (!muxer || !videoEncoder) {
    throw new Error("Muxer or video encoder is not initialized");
  }

  clearInterval(encodeInterval!);

  await videoEncoder.flush();
  muxer.finalize();

  const buffer = muxer.target.buffer;

  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(buffer);
    await writable.close();
  }

  useCanvasStore.getState().setIsRendering(false);

  muxer = null;
  videoEncoder = null;
  isRendering = false;

  resetAudio();
}

function encodeVideoFrame() {
  if (!isRendering) return;

  if (videoEncoder?.state === "closed") {
    stopAndResetRendering();
    return;
  }

  if (didAudioEnd()) {
    finishRendering();
    return;
  }

  const pixiApp = useCanvasStore.getState().pixiApp;
  if (!pixiApp) {
    stopAndResetRendering();
    throw new Error("Pixi app is not initialized");
  }
  const canvas = pixiApp.view as HTMLCanvasElement;
  pixiApp.ticker.update();
  pixiApp.renderer.render(pixiApp.stage);

  let elapsedTime = (document.timeline.currentTime as number) - startTime!;

  const frame = new VideoFrame(canvas, {
    timestamp: framesGenerated * (1e6 / 60),
    duration: 1e6 / 60,
  });

  framesGenerated++;

  let needsKeyFrame = elapsedTime - lastKeyFrame! >= 5000;
  if (needsKeyFrame) {
    lastKeyFrame = elapsedTime;
  }

  videoEncoder!.encode(frame, {
    keyFrame: needsKeyFrame,
  });
  frame.close();
}
