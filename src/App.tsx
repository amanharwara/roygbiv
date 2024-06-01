import AudioFileDropZone from "./components/audio/AudioFileDropZone";
import {
  DialogTrigger,
  Key,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TooltipTrigger,
} from "react-aria-components";
import { Settings2 as SettingsIcon } from "lucide-react";
import { CanvasSettingsModal } from "./components/CanvasSettingsModal";
import { SelectedAudio } from "./components/audio/SelectedAudio";
import Tooltip from "./components/ui/Tooltip";
import LayersList from "./components/layers/LayersList";
import SelectedLayerProperties from "./components/layers/SelectedLayerProperties";
import { audioStore } from "./stores/audio";
import { useState } from "react";
import FrequencyRangesList from "./components/frequencyRanges/FrequencyRangesList";
import SelectedFrequencyRangeOptions from "./components/frequencyRanges/SelectedFrequencyRangeOptions";
import { Canvas } from "./components/Canvas";
import Button from "./components/ui/Button";
import { useCanvasStore } from "./stores/canvas";
import { twMerge } from "tailwind-merge";

export default function App() {
  const file = audioStore((state) => state.audioFile);
  const isRendering = useCanvasStore((state) => state.isRendering);

  const [selectedTab, setSelectedTab] = useState<Key>("layers");

  return (
    <div
      className={twMerge(
        "grid h-full overflow-hidden",
        isRendering ? "grid-cols-1" : "grid-cols-[5fr,1.5fr]",
      )}
    >
      <div className="flex flex-grow flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-grow items-center justify-center overflow-hidden">
          <div className="h-full w-full overflow-auto p-8">
            <Canvas />
          </div>
          <DialogTrigger>
            <TooltipTrigger delay={150} closeDelay={0}>
              <Button className="absolute right-6 top-6 p-1.5">
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Tooltip offset={4}>Change canvas settings</Tooltip>
            </TooltipTrigger>
            <CanvasSettingsModal />
          </DialogTrigger>
        </div>
        <div className="flex-shrink-0 border-t border-neutral-600">
          {file ? <SelectedAudio /> : <AudioFileDropZone />}
        </div>
      </div>
      {!isRendering && (
        <div className="grid h-full grid-rows-[60%_40%] overflow-hidden border-l border-neutral-600 [grid-column:2]">
          <div className="flex flex-col overflow-hidden">
            {selectedTab === "layers" && <SelectedLayerProperties />}
            {selectedTab === "ranges" && <SelectedFrequencyRangeOptions />}
          </div>
          <Tabs
            className="flex flex-shrink-0 select-none flex-col overflow-hidden"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key)}
          >
            <TabList className="flex items-center border-y border-neutral-600 text-sm font-semibold">
              <Tab
                className="px-3 py-2 hover:bg-neutral-700 [&[data-selected]]:bg-neutral-600"
                id="layers"
              >
                Layers
              </Tab>
              <Tab
                className="px-3 py-2 hover:bg-neutral-700 [&[data-selected]]:bg-neutral-600"
                id="ranges"
              >
                Ranges
              </Tab>
            </TabList>
            <TabPanel id="layers" className="flex flex-grow flex-col">
              <LayersList />
            </TabPanel>
            <TabPanel id="ranges" className="flex flex-grow flex-col">
              <FrequencyRangesList />
            </TabPanel>
          </Tabs>
        </div>
      )}
    </div>
  );
}
