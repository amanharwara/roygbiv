import { type Component, createSignal, Show, type Accessor } from "solid-js";
import { Dropzone } from "./components/Dropzone";

const AudioFile: Component<{ file: Accessor<File> }> = (props) => {
  return <audio controls src={URL.createObjectURL(props.file())} />;
};

const App: Component = () => {
  const [file, setFile] = createSignal<File>();

  const onDrop = (file: File) => setFile(() => file);

  return (
    <div class="h-full w-full p-4">
      <Show
        when={file()}
        fallback={
          <Dropzone mimeType="audio/*" onDrop={onDrop}>
            <div class="text-lg font-semibold">Drag and drop an audio file</div>
            <div class="text-sm">Or click to open file picker</div>
          </Dropzone>
        }
      >
        <AudioFile file={file} />
      </Show>
    </div>
  );
};

export default App;
