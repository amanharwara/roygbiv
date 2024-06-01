import {
  audioElement,
  didAudioEnd,
  playAudio,
  resetAudio,
} from "../audio/context";
import { useCanvasStore } from "../stores/canvas";
import { concatenateUint8Arrays } from "../utils/concatenateUint8Arrays";
import { bitrate, fps, renderInterval } from "../constants";
import { ffmpeg, loadFFmpeg } from "./ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { audioStore } from "../stores/audio";

let isRendering = false;
let canvas: HTMLCanvasElement | null = null;
let encodeInterval: number | null = null;

let videoEncoder: VideoEncoder | null = null;
let chunks: Uint8Array[] = [];
function handleChunk(chunk: EncodedVideoChunk) {
  let chunkData: Uint8Array | null = new Uint8Array(chunk.byteLength);
  chunk.copyTo(chunkData);
  chunks.push(chunkData);
  chunkData = null;
}

let framesGenerated = 0;
let startTime: number | null = null;
let lastKeyFrame: number | null = null;
let lastTimestamp = 0;

export async function startRendering() {
  if (!ffmpeg.loaded) {
    await loadFFmpeg();
  }

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
    bitrate: bitrate,
    framerate: fps,
    bitrateMode: "constant",
  });

  isRendering = true;
  useCanvasStore.getState().setIsRendering(true);
  framesGenerated = 0;
  startTime = document.timeline.currentTime as number;
  lastKeyFrame = -Infinity;
  lastTimestamp = 0;

  resetAudio();
  playAudio();

  renderFrame();
  encodeInterval = window.setInterval(renderFrame, renderInterval);
}

async function finishRendering(finalFrames: Uint8Array) {
  const containerName = "composed.h264";
  const outputName = "output.mp4";

  await ffmpeg.writeFile(containerName, finalFrames);

  const audioFile = audioStore.getState().audioFile;
  if (!audioFile) {
    throw new Error("Audio file is not set");
  }

  const audioName = "audio";
  await ffmpeg.writeFile(audioName, await fetchFile(audioFile));

  const duration = lastTimestamp / bitrate;

  await ffmpeg.exec([
    "-r",
    `${fps}`,
    "-i",
    `${containerName}`,
    "-i",
    `${audioName}`,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-t",
    `${duration}`,
    "-y",
    `${outputName}`,
  ]);

  const muxedBytes = await ffmpeg.readFile(outputName);

  const downloadButton = document.createElement("button");
  downloadButton.innerText = "Download";
  downloadButton.className =
    "rounded border border-neutral-600 bg-neutral-700 px-2.5 py-1.5 text-sm hover:bg-neutral-600 focus:shadow-none focus:outline-none focus-visible:border-slate-400";
  downloadButton.onclick = async () => {
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "MP4 file",
          accept: {
            "video/mp4": [".mp4"],
          },
        },
      ],
    });

    const writable = await fileHandle.createWritable();
    await writable.write(muxedBytes);
    await writable.close();

    downloadButton.remove();
  };

  document.body.appendChild(downloadButton);
  chunks = [];
}

export function stopRendering() {
  isRendering = false;
  useCanvasStore.getState().setIsRendering(false);
  resetAudio();

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

  const timestamp = framesGenerated * (bitrate / fps);

  const frame = new VideoFrame(canvas, {
    timestamp,
    duration: bitrate / fps,
  });

  framesGenerated++;
  lastTimestamp = timestamp;

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
