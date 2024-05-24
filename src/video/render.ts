import { didAudioEnd, playAudio, resetAudio } from "../audio/context";
import { useCanvasStore } from "../stores/canvas";
import { EncodeWorkerMessage, EncodeWorkerMessageType } from "./encode-worker";
import EncodeWorker from "./encode-worker?worker";

let isRendering = false;
let canvas: HTMLCanvasElement | null = null;
let encodedFrames: Uint8Array | null = null;

const encodeWorker = new EncodeWorker();

encodeWorker.onmessage = (event: MessageEvent) => {
  const message = event.data as EncodeWorkerMessage;
  if (message.type === EncodeWorkerMessageType.AllEncodedFrames) {
    encodedFrames = message.payload;
    doFFmpegStuff(encodedFrames);
  }
};

async function doFFmpegStuff(encodedFrames: Uint8Array) {
  // @TODO
}

export function startRendering() {
  const pixiApp = useCanvasStore.getState().pixiApp;
  if (!pixiApp) return;
  canvas = pixiApp.view as HTMLCanvasElement;
  resetAudio();
  isRendering = true;
  useCanvasStore.getState().setIsRendering(true);
  playAudio();
}

export function stopRendering() {
  isRendering = false;
  useCanvasStore.getState().setIsRendering(false);
  encodeWorker.postMessage({
    type: EncodeWorkerMessageType.RequestAllFrames,
    payload: undefined,
  } satisfies EncodeWorkerMessage);
}

const renderFrame = () => {
  if (!isRendering) return;

  if (didAudioEnd()) {
    stopRendering();
    return;
  }

  const frame = new VideoFrame(canvas!);
  encodeWorker.postMessage({
    type: EncodeWorkerMessageType.EncodeFrame,
    payload: frame,
  } satisfies EncodeWorkerMessage);
  frame.close();

  requestAnimationFrame(renderFrame);
};

requestAnimationFrame(renderFrame);
