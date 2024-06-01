import { FFmpeg } from "@ffmpeg/ffmpeg";
import ffMpegCoreWorker from "../ffmpeg-js/ffmpeg-core.worker?url";
import { useCanvasStore } from "../stores/canvas";

export const ffmpeg = new FFmpeg();
const ffmpegBaseUrl = new URL("../ffmpeg-js", import.meta.url).href;
ffmpeg.on("log", ({ type, message }) => {
  console.log(type, message);
});
ffmpeg.on("progress", ({ progress, time }) => {
  console.log(progress, time);
});
ffmpeg
  .load({
    coreURL: `${ffmpegBaseUrl}/ffmpeg-core.js`,
    wasmURL: `${ffmpegBaseUrl}/ffmpeg-core.wasm`,
    workerURL: ffMpegCoreWorker,
  })
  .then((loaded) => {
    useCanvasStore.getState().setIsFFmpegReady(loaded);
  });
