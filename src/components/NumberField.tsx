import {
  NumberField as RacNumberField,
  Label,
  Input,
  NumberFieldProps,
  Group,
  Button,
} from "react-aria-components";
import clsx from "../utils/clsx";
import ResetIcon from "../icons/ResetIcon";

type Props = NumberFieldProps & {
  label: string;
};

const NumberField = ({ label, className, ...props }: Props) => {
  return (
    <RacNumberField
      minValue={0}
      className={clsx("group flex flex-col gap-1", className)}
      {...props}
    >
      {({ state }) => (
        <>
          <Label>{label}</Label>
          <Group className="flex w-fit rounded">
            <Button
              className="rounded rounded-ee-none rounded-se-none border border-neutral-600 bg-neutral-700 px-2.5 hover:bg-neutral-600"
              slot="decrement"
            >
              -
            </Button>
            <Input className="z-[1] -mx-px border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-neutral-300" />
            <Button
              className="rounded rounded-es-none rounded-ss-none border border-neutral-600 bg-neutral-700 px-2.5 hover:bg-neutral-600"
              slot="increment"
            >
              +
            </Button>
            <button
              onClick={() => {
                if (props.defaultValue) {
                  state.setNumberValue(props.defaultValue);
                }
              }}
              className="ml-1.5 rounded border border-neutral-600 bg-neutral-700 px-2 hover:bg-neutral-600"
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
