import {
  SelectProps as RacSelectProps,
  Select as RacSelect,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ItemProps,
  Item,
  ListBoxProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface SelectProps<T extends object>
  extends Omit<RacSelectProps<T>, "children"> {
  label: string;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  items: ListBoxProps<T>["items"];
  className?: string;
}

export function Select<T extends object>({
  label,
  children,
  className,
  items,
  ...props
}: SelectProps<T>) {
  return (
    <RacSelect
      className={twMerge("group flex flex-col items-start gap-1", className)}
      {...props}
    >
      <Label>{label}</Label>
      <Button className="flex w-full items-center justify-between rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-slate-400">
        <SelectValue />
        <svg
          viewBox="0 0 12 6"
          className="mx-1 h-2.5 w-2.5 fill-current transition-transform duration-75 group-data-[open]:rotate-180"
        >
          <path d="M0 0,L6 6,L12 0" />
        </svg>
      </Button>
      <Popover className="w-[--trigger-width] rounded border border-neutral-700 bg-neutral-800 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out">
        <ListBox
          items={items}
          className="max-h-[inherit] min-w-[10rem] select-none overflow-auto px-1 pb-1 pt-1 outline-none"
        >
          {children}
        </ListBox>
      </Popover>
    </RacSelect>
  );
}

export function SelectItem(props: ItemProps) {
  return (
    <Item
      {...props}
      className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none data-[focused]:bg-neutral-900"
    />
  );
}
