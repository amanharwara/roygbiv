import { ArrayBufferTarget, Muxer } from "mp4-muxer";

export class Renderer {
  private muxer: Muxer<ArrayBufferTarget>;

  constructor(width: number, height: number) {
    this.muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: "avc",
        width,
        height,
      },
      fastStart: "in-memory",
    });
  }
}
