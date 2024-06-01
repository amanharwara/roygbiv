import { audioElement } from "../../audio/context";
import { useCallback } from "react";
import { audioStore } from "../../stores/audio";
import Button from "../ui/Button";
import { startRendering, stopRendering } from "../../video/render";
import { useCanvasStore } from "../../stores/canvas";

export function SelectedAudio() {
  const { isRendering, isFFmpegReady } = useCanvasStore((state) => ({
    isRendering: state.isRendering,
    isFFmpegReady: state.isFFmpegReady,
  }));
  const file = audioStore((state) => state.audioFile);

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
            {isRendering ? (
              <Button
                className="hover:border-red-700 hover:bg-red-700 focus:border-red-700 focus:bg-red-700"
                onPress={() => {
                  stopRendering();
                }}
              >
                Finish rendering
              </Button>
            ) : (
              <Button
                onPress={() => {
                  startRendering();
                }}
              >
                Render video
              </Button>
            )}
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
