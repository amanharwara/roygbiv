import { useState } from "react";
import AudioFileDropZone from "./components/AudioFileDropZone";
import SelectedAudioFile from "./components/SelectedAudioFile";

export default function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  if (!audioFile) {
    return <AudioFileDropZone setAudioFile={setAudioFile} />;
  }

  return <SelectedAudioFile file={audioFile} />;
}
