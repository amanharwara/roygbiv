import { twJoin } from "tailwind-merge";
import { Button, DropZone, FileTrigger, Text } from "react-aria-components";
import { audioStore } from "../../audio/store";

function AudioFileDropZone() {
  return (
    <div className="h-full w-full p-4">
      <DropZone
        getDropOperation={(types) => {
          const typesArray = Array.from(types as Set<string>);
          if (typesArray.every((type) => type.startsWith("audio"))) {
            return "copy";
          }
          return "cancel";
        }}
        onDrop={async (event) => {
          const item = event.items[0];
          if (!item) return;
          if (item.kind !== "file") return;
          if (!item.type.startsWith("audio")) return;
          const file = await item.getFile();
          audioStore.getState().setAudioFile(file);
        }}
        className={({ isDropTarget }) =>
          twJoin(
            "flex h-full w-full select-none flex-col items-center justify-center gap-4 rounded border-dashed border-neutral-600 p-8",
            isDropTarget ? "border-4" : "border-2",
          )
        }
      >
        <Text className="text-xl" slot="label">
          Drop an audio file here, or
        </Text>
        <FileTrigger
          acceptedFileTypes={["audio/*"]}
          onSelect={(files) => {
            if (!files) return;
            const file = files[0];
            if (!file) return;
            audioStore.getState().setAudioFile(file);
          }}
        >
          <Button className="rounded border border-neutral-600 px-2 py-1 hover:bg-white hover:text-black">
            Click here to select file
          </Button>
        </FileTrigger>
      </DropZone>
    </div>
  );
}

export default AudioFileDropZone;
