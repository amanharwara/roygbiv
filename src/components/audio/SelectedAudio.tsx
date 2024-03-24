import { audioElement } from "../../audio/context";
import { Button } from "react-aria-components";
import DeleteIcon from "../../icons/DeleteIcon";
import { useCallback } from "react";
import { store } from "../../audio/store";

export function SelectedAudio() {
  const file = store((state) => state.audioFile);

  const appendAudioElement = useCallback((containerRef: HTMLElement | null) => {
    if (!containerRef) return;

    audioElement.className = "w-full";
    audioElement.controls = true;
    containerRef.appendChild(audioElement);
  }, []);

  if (!file) return null;

  return (
    <div className="flex items-center gap-8 p-8">
      <div className="flex flex-shrink-0 flex-col items-start gap-2">
        <div>{file.name}</div>
        <Button
          className="flex items-center gap-1 rounded border border-neutral-600 px-2 py-1.5 text-sm hover:bg-white hover:text-black"
          onPress={() => {
            store.getState().setAudioFile(null);
          }}
        >
          <DeleteIcon className="h-4 w-4" />
          Remove audio
        </Button>
      </div>
      <div className="flex-grow" ref={appendAudioElement} />
    </div>
  );
}
