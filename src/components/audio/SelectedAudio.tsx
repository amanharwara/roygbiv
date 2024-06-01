import { audioElement } from "../../audio/context";
import { useCallback, useState } from "react";
import { audioStore } from "../../stores/audio";
import Button from "../ui/Button";
import { useCanvasStore } from "../../stores/canvas";
import { VideoExport } from "../../video/VideoExport";

export function SelectedAudio() {
  const file = audioStore((state) => state.audioFile);

  const { isFFmpegReady, pixiApp, isRendering } = useCanvasStore();

  const [videoExport, setVideoExport] = useState<VideoExport | null>(null);

  const appendAudioElement = useCallback((containerRef: HTMLElement | null) => {
    if (!containerRef) return;

    audioElement.className = "w-full";
    audioElement.controls = true;
    containerRef.appendChild(audioElement);
  }, []);

  if (!file) return null;

  return (
    <>
      <div className="flex items-center gap-8 p-8">
        <div className="flex flex-shrink-0 flex-col items-start gap-2">
          <div>{file.name}</div>
          <div className="flex items-center gap-2.5">
            {!!videoExport && videoExport.finalBytes ? (
              <Button
                onPress={async () => {
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
                  await writable.write(videoExport.finalBytes!);
                  await writable.close();
                }}
              >
                Download video
              </Button>
            ) : null}
            {!!pixiApp && !isRendering && isFFmpegReady && (
              <Button
                onPress={async () => {
                  const canvas = pixiApp.view as HTMLCanvasElement;

                  const videoExport = new VideoExport(canvas);
                  setVideoExport(videoExport);

                  videoExport.startRendering();
                }}
              >
                Render video
              </Button>
            )}
            {!!videoExport && isRendering ? (
              <Button
                className="hover:border-red-700 hover:bg-red-700 focus:border-red-700 focus:bg-red-700"
                onPress={() => {
                  videoExport.stopRendering();
                }}
              >
                Finish rendering
              </Button>
            ) : null}
            <Button
              className="hover:border-red-700 hover:bg-red-700 focus:border-red-700 focus:bg-red-700"
              onPress={() => {
                audioStore.getState().setAudioFile(null);
              }}
              isDisabled={isRendering}
            >
              Remove audio
            </Button>
          </div>
        </div>
        <div className="flex-grow" ref={appendAudioElement} />
      </div>
    </>
  );
}
