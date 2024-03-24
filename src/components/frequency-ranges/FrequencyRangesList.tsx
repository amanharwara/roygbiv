import {
  ListBox,
  TooltipTrigger,
  Button,
  ListBoxItem,
  Header,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Section,
} from "react-aria-components";
import AddIcon from "../../icons/AddIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import {
  FrequencyRange,
  PresetFrequencyRanges,
  audioStore,
} from "../../audio/store";
import Tooltip from "../ui/Tooltip";

function RangeListItem({ range }: { range: FrequencyRange }) {
  return (
    <ListBoxItem
      className="flex w-full items-center gap-2 overflow-hidden bg-neutral-900 px-3 py-1.5 text-sm outline-none aria-selected:bg-neutral-700 aria-selected:font-medium data-[dragging]:opacity-75"
      id={range.name}
      textValue={range.name}
    >
      <div className="overflow-hidden text-ellipsis">{range.name}</div>
    </ListBoxItem>
  );
}

function FrequencyRangesList() {
  const ranges = audioStore((state) => state.ranges);

  const selectedRange = audioStore((state) => state.selectedRange);
  const setSelectedRange = audioStore((state) => state.setSelectedRange);

  return (
    <>
      <div className="min-h-0 flex-grow overflow-auto">
        <ListBox
          className="w-full overflow-hidden py-px"
          aria-label="Layers"
          items={ranges}
          selectedKeys={selectedRange ? [selectedRange] : []}
          selectionMode="single"
          selectionBehavior="replace"
          onSelectionChange={(keys) => {
            if (keys !== "all") {
              keys.forEach((key) => {
                if (!(typeof key === "string")) {
                  return;
                }
                setSelectedRange(key);
              });
            }
          }}
        >
          {ranges.map((range) => (
            <RangeListItem key={range.name} range={range} />
          ))}
        </ListBox>
      </div>
      <div className="flex items-center gap-2 border-t border-neutral-600 px-2 py-1.5">
        <MenuTrigger>
          <TooltipTrigger delay={150} closeDelay={0}>
            <Button className="flex items-center justify-center rounded p-1 hover:bg-neutral-600 data-[pressed]:bg-neutral-800">
              <AddIcon className="h-4 w-4" />
            </Button>
            <Tooltip offset={4}>Add a new layer</Tooltip>
          </TooltipTrigger>
          <Popover
            offset={2}
            className="rounded border border-neutral-700 bg-neutral-800 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out "
          >
            <Menu
              autoFocus="first"
              shouldFocusWrap
              className="max-h-[inherit] min-w-[12rem] select-none space-y-2 overflow-auto px-1.5 pb-1.5 pt-2 outline-none"
              onAction={(key) => {
                let id: string;
                if (key === "custom") {
                  id = audioStore.getState().addNewRange();
                } else {
                  id = audioStore
                    .getState()
                    .addNewRange(key as keyof typeof PresetFrequencyRanges);
                }
                setSelectedRange(id);
              }}
            >
              <Section>
                <Header className="px-1.5 pb-1 text-sm font-semibold">
                  Add Range
                </Header>
                <MenuItem
                  id="custom"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                >
                  Custom range
                </MenuItem>
              </Section>
              <Section>
                <Header className="px-1.5 pb-1 text-sm font-semibold">
                  Presets
                </Header>
                {Object.entries(PresetFrequencyRanges).map(([key, value]) => (
                  <MenuItem
                    key={key}
                    id={key}
                    className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
                  >
                    <span className="capitalize">{key}</span> ({value.min} -{" "}
                    {value.max} Hz)
                  </MenuItem>
                ))}
              </Section>
            </Menu>
          </Popover>
        </MenuTrigger>
        <TooltipTrigger delay={150} closeDelay={0}>
          <Button
            // onPress={removeSelectedLayer}
            className="flex items-center justify-center rounded p-1 hover:bg-neutral-600 disabled:opacity-70"
            isDisabled={true}
          >
            <DeleteIcon className="h-4 w-4" />
          </Button>
          <Tooltip offset={4}>Delete selected range</Tooltip>
        </TooltipTrigger>
      </div>
    </>
  );
}

export default FrequencyRangesList;
