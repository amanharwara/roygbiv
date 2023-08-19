import { useMemo, useState } from "react";
import clsx from "./utils/clsx";
import { Button, DropZone, FileTrigger, Text } from "react-aria-components";

export default function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioSrc = useMemo(() => {
    if (!audioFile) return null;
    return URL.createObjectURL(audioFile);
  }, [audioFile]);

  if (!audioFile) {
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
            if (item.kind !== "file") return;
            if (!item.type.startsWith("audio")) return;
            const file = await item.getFile();
            setAudioFile(file);
          }}
          className={({ isDropTarget }) =>
            clsx(
              "flex h-full w-full flex-col items-center justify-center gap-4 rounded border-dashed",
              isDropTarget ? "border-4" : "border-2",
            )
          }
        >
          <Text className="text-xl" slot="label">
            Drop an audio file here, or
          </Text>
          <FileTrigger
            acceptedFileTypes={["audio/*"]}
            onChange={(files) => {
              setAudioFile(files[0]);
            }}
          >
            <Button className="rounded border border-white px-2 py-1 hover:bg-white hover:text-black">
              Click here to select file
            </Button>
          </FileTrigger>
        </DropZone>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4">
      {audioFile.name}
      <audio src={audioSrc} controls />
    </div>
  );
}
