const Codec = "avc1.42001E";

function reportError(error: Error) {
  // Report error to the main thread
  console.log(error.message);
  postMessage(error.message);
}

function captureAndEncode(
  frameSource: ReadableStream,
  canvas: {
    width: number;
    height: number;
  },
  fps: number,
  processChunk: EncodedVideoChunkOutputCallback,
) {
  let frameCounter = 0;

  const init = {
    output: processChunk,
    error: reportError,
  };

  const config: VideoEncoderConfig = {
    codec: Codec,
    width: canvas.width,
    height: canvas.height,
    bitrate: 1000000,
    avc: { format: "annexb" },
    framerate: fps,
    hardwareAcceleration: "prefer-hardware",
  };

  const encoder = new VideoEncoder(init);
  encoder.configure(config);

  const reader = frameSource.getReader();
  async function readFrame() {
    const result = await reader.read();
    const frame = result.value;

    if (encoder.encodeQueueSize < 2) {
      frameCounter++;
      const insert_keyframe = false; // (frame_counter % 130) == 0;
      encoder.encode(frame, { keyFrame: insert_keyframe });
      frame.close();
    } else {
      // Too many frames in flight, encoder is overwhelmed
      // let's drop this frame.
      console.log("dropping a frame");
      frame.close();
    }

    setTimeout(readFrame, 1);
  }

  readFrame();
}

function main(
  frameSource: ReadableStream,
  canvas: HTMLCanvasElement,
  fps: number,
) {
  function processChunk(
    chunk: EncodedVideoChunk,
    metadata: EncodedVideoChunkMetadata | undefined,
  ) {
    console.log("chunk", chunk, metadata);
  }
  captureAndEncode(frameSource, canvas, fps, processChunk);
}

self.onmessage = async function (event) {
  const frameSource = event.data.frameSource;
  const canvas = event.data.canvas;
  const fps = event.data.fps;

  main(frameSource, canvas, fps);
};
