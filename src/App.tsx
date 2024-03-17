import {
  pauseAudio,
  playAudio,
  resetAudio,
  setAudioSrc,
} from "./audio/context";
import { store } from "./audio/store.ts";
import { mapNumber } from "./utils/numbers";
import { useEffect, useRef } from "react";

function AudioControls() {
  return (
    <>
      <input
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          setAudioSrc(URL.createObjectURL(file));
        }}
      />
      <div className="flex items-center gap-4">
        <button onClick={playAudio}>play</button>
        <button onClick={pauseAudio}>pause</button>
        <button onClick={resetAudio}>reset</button>
      </div>
    </>
  );
}

function Viz() {
  const ref = useRef<HTMLDivElement>(null);

  // const level = useStore(store, (state) => state.level);
  // const mapped = mapNumber(level, 0, 1, 50, 100);

  useEffect(
    () =>
      store.subscribe(({ level }) => {
        const element = ref.current;
        if (!element) return;

        const mapped = mapNumber(level, 0, 1, 100, 250);

        element.animate(
          { scale: `${mapped}%` },
          { duration: 20, fill: "forwards" },
        );
      }),
    [],
  );

  return (
    <div
      ref={ref}
      style={{
        borderRadius: "100%",
        background: "red",
        width: "50px",
        height: "50px",
        translate: "100% 100%",
      }}
    />
  );
}

export default function App() {
  return (
    <div className="flex flex-col gap-4 p-8 text-base">
      <AudioControls />
      <Viz />
    </div>
  );
}
