import { ffmpeg } from "./ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { DefaultBitrate, DefaultFPS } from "../constants";
import { didAudioEnd, playAudio, resetAudio } from "../audio/context";
import { useCanvasStore } from "../stores/canvas";
import { concatenateUint8Arrays } from "../utils/concatenateUint8Arrays";
import { audioStore } from "../stores/audio";

export class VideoExport {
  framesGenerated = 0;
  lastTimestamp = 0;

  startTime = document.timeline.currentTime as number;
  lastKeyFrame = 0;

  videoEncoder: VideoEncoder;

  chunks: Uint8Array[] = [];

  encodeInterval: number | null = null;

  isRendering = false;

  finalBytes: Uint8Array | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    private bitrate: number = DefaultBitrate,
    private fps: number = DefaultFPS,
  ) {
    const evenedWidth =
      canvas.width % 2 === 0 ? canvas.width : canvas.width + 1;
    const evenedHeight =
      canvas.height % 2 === 0 ? canvas.height : canvas.height + 1;

    this.videoEncoder = new VideoEncoder({
      output: this.handleChunk,
      error: (e) => console.error(e),
    });
    this.videoEncoder.configure({
      codec: "avc1.640034",
      avc: { format: "annexb" },
      width: evenedWidth,
      height: evenedHeight,
      bitrate: bitrate,
      framerate: fps,
      bitrateMode: "constant",
    });
  }

  handleChunk = (chunk: EncodedVideoChunk) => {
    let chunkData: Uint8Array | null = new Uint8Array(chunk.byteLength);
    chunk.copyTo(chunkData);
    this.chunks.push(chunkData);
    chunkData = null;
  };

  startRendering = () => {
    resetAudio();
    playAudio();
    this.isRendering = true;
    useCanvasStore.getState().setIsRendering(true);
    this.renderFrame();
    this.encodeInterval = window.setInterval(this.renderFrame, 1000 / this.fps);
  };

  stopRendering = () => {
    resetAudio();

    if (this.encodeInterval) {
      window.clearInterval(this.encodeInterval);
      this.encodeInterval = null;
    }

    if (this.videoEncoder) {
      this.videoEncoder.flush();
    }

    const finalFrames = concatenateUint8Arrays(this.chunks);
    this.finishRendering(finalFrames).catch(console.error);
  };

  finishRendering = async (finalFrames: Uint8Array) => {
    const containerName = "composed.h264";
    const outputName = "output.mp4";

    await ffmpeg.writeFile(containerName, finalFrames);

    const audioFile = audioStore.getState().audioFile;
    if (!audioFile) {
      throw new Error("Audio file is not set");
    }

    const audioName = "audio";
    await ffmpeg.writeFile(audioName, await fetchFile(audioFile));

    const duration = this.lastTimestamp / this.bitrate;

    await ffmpeg.exec([
      "-r",
      `${this.fps}`,
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
    this.finalBytes = muxedBytes as Uint8Array;

    this.isRendering = false;
    useCanvasStore.getState().setIsRendering(false);
  };

  renderFrame = () => {
    if (!this.isRendering) return;

    if (didAudioEnd()) {
      this.stopRendering();
      return;
    }

    const pixiApp = useCanvasStore.getState().pixiApp;
    if (!pixiApp) {
      this.stopRendering();
      throw new Error("Pixi app is not initialized");
    }
    const canvas = pixiApp.view as HTMLCanvasElement;
    pixiApp.ticker.update();
    pixiApp.renderer.render(pixiApp.stage);

    const timestamp = this.framesGenerated * (this.bitrate / this.fps);

    const frame = new VideoFrame(canvas, {
      timestamp,
      duration: this.bitrate / this.fps,
    });

    this.framesGenerated++;
    this.lastTimestamp = timestamp;

    let elapsedTime =
      (document.timeline.currentTime as number) - this.startTime!;

    let needsKeyFrame = elapsedTime - this.lastKeyFrame! >= 5000;
    if (needsKeyFrame) {
      this.lastKeyFrame = elapsedTime;
    }

    this.videoEncoder!.encode(frame, {
      keyFrame: needsKeyFrame,
    });
    frame.close();
  };
}
