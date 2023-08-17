import { ParentComponent, Show } from "solid-js";
import { VisuallyHidden } from "./VisuallyHidden";

type SingleFileDrop = {
  onDrop: (file: File) => void;
  multiple?: never;
};

type MultipleFileDrop = {
  onDrop: (files: File[]) => void;
  multiple: true;
};

export const Dropzone: ParentComponent<
  {
    mimeType: string;
  } & (SingleFileDrop | MultipleFileDrop)
> = (props) => {
  let inputRef: HTMLInputElement | null = null;

  const handleOnDrop = (files: File[]) => {
    if (!("multiple" in props)) {
      props.onDrop(files[0]);
    } else if (props.multiple) {
      props.onDrop(files);
    }
  };

  return (
    <>
      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          accept={props.mimeType}
          multiple={props.multiple}
          onChange={(e) => {
            const files = e.target.files;
            if (!files || !files.length) return;
            handleOnDrop(Array.from(files));
          }}
        />
      </VisuallyHidden>
      <button
        onClick={() => inputRef.click()}
        class="flex w-full h-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-white p-2 hover:border-4"
        onDragStart={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (!e.dataTransfer.types.includes("Files")) return;
          const files = Array.from(e.dataTransfer.files).filter(
            (f) => f.type === props.mimeType
          );
          if (!files.length) return;
          handleOnDrop(files);
        }}
      >
        <Show
          when={props.children}
          fallback={
            <>
              <div class="text-lg font-semibold">
                Drag and drop files to auto-detect and import
              </div>
              <div class="text-sm">Or click to open file picker</div>
            </>
          }
        >
          {props.children}
        </Show>
      </button>
    </>
  );
};
