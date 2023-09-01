import {
  NumberField as RacNumberField,
  Label,
  Input,
  NumberFieldProps,
  Group,
  Button,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import ResetIcon from "../icons/ResetIcon";

type Props = NumberFieldProps & {
  label: string;
  className?: string;
  groupClassName?: string;
};

const NumberField = ({ label, className, groupClassName, ...props }: Props) => {
  return (
    <RacNumberField
      minValue={0}
      className={twMerge("group flex flex-col items-start gap-1", className)}
      {...props}
    >
      {({ state }) => (
        <>
          <Label>{label}</Label>
          <Group
            className={twMerge(
              "flex w-fit overflow-hidden rounded",
              groupClassName,
            )}
          >
            <Button
              className="select-none rounded rounded-ee-none rounded-se-none border border-neutral-600 bg-neutral-700 px-3 hover:bg-neutral-600 disabled:bg-neutral-700 disabled:opacity-80"
              slot="decrement"
            >
              -
            </Button>
            <Input className="z-[1] -mx-px w-[15ch] flex-1 border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-slate-400" />
            <Button
              className="select-none rounded rounded-es-none rounded-ss-none border border-neutral-600 bg-neutral-700 px-3 hover:bg-neutral-600 disabled:bg-neutral-700 disabled:opacity-80"
              slot="increment"
            >
              +
            </Button>
            <button
              type="button"
              onClick={() => {
                if (props.defaultValue != undefined) {
                  state.setNumberValue(props.defaultValue);
                }
              }}
              className="ml-1.5 flex-shrink-0 select-none rounded border border-neutral-600 bg-neutral-700 px-2 outline-none hover:bg-neutral-600 focus:border-slate-400"
            >
              <ResetIcon className="h-3.5 w-3.5" />
            </button>
          </Group>
        </>
      )}
    </RacNumberField>
  );
};

export default NumberField;
