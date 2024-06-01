import { concatenateUint8Arrays } from "../utils/concatenateUint8Arrays";
import { fps } from "../constants";

export enum EncodeWorkerMessageType {
  UpdateConfig = "update-config",
  EncodeFrame = "encode-frame",
  RequestAllFrames = "request-all-frames",
  AllEncodedFrames = "all-encoded-frames",
}

export type EncodeWorkerMessage =
  | {
      type: EncodeWorkerMessageType.UpdateConfig;
      payload: Partial<VideoEncoderConfig>;
    }
  | { type: EncodeWorkerMessageType.EncodeFrame; payload: VideoFrame }
  | { type: EncodeWorkerMessageType.RequestAllFrames; payload: undefined }
  | { type: EncodeWorkerMessageType.AllEncodedFrames; payload: Uint8Array };

const chunks: Uint8Array[] = [];
function handleChunk(chunk: EncodedVideoChunk) {
  let chunkData: Uint8Array | null = new Uint8Array(chunk.byteLength);
  chunk.copyTo(chunkData);
  chunks.push(chunkData);
  chunkData = null;
}

const config: VideoEncoderConfig = {
  codec: "avc1.640034",
  avc: {
    format: "annexb",
  },
  width: 1280,
  height: 720,
  bitrate: 1e9,
  framerate: fps,
  bitrateMode: "constant",
};

const encoder = new VideoEncoder({
  output: handleChunk,
  error: (error) => {
    console.error(error.message);
  },
});

self.addEventListener("message", async (message) => {
  const data = message.data as EncodeWorkerMessage;
  if (data.type === EncodeWorkerMessageType.UpdateConfig) {
    encoder.configure({
      ...config,
      ...data.payload,
    });
  }
  if (data.type === EncodeWorkerMessageType.EncodeFrame) {
    const frame = data.payload;
    encoder.encode(frame);
    frame.close();
  }
  if (data.type === EncodeWorkerMessageType.RequestAllFrames) {
    await encoder.flush();
    const allFrames = concatenateUint8Arrays(chunks);
    self.postMessage({
      type: EncodeWorkerMessageType.AllEncodedFrames,
      payload: allFrames,
    } as EncodeWorkerMessage);
    chunks.splice(0, chunks.length);
  }
});
