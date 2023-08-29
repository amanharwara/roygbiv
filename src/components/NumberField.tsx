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
      className={twMerge("group flex flex-col gap-1", className)}
      {...props}
    >
      {({ state }) => (
        <>
          <Label>{label}</Label>
          <Group className={twMerge("flex w-fit rounded", groupClassName)}>
            <Button
              className="rounded rounded-ee-none rounded-se-none border border-gray-600 bg-gray-700 px-3 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-80"
              slot="decrement"
            >
              -
            </Button>
            <Input className="z-[1] -mx-px flex-1 border border-gray-600 bg-gray-700 px-2 py-1.5 text-sm outline-none group-focus-within:border-gray-300" />
            <Button
              className="rounded rounded-es-none rounded-ss-none border border-gray-600 bg-gray-700 px-3 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-80"
              slot="increment"
            >
              +
            </Button>
            <button
              onClick={() => {
                if (props.defaultValue != undefined) {
                  state.setNumberValue(props.defaultValue);
                }
              }}
              className="ml-1.5 rounded border border-gray-600 bg-gray-700 px-2 hover:bg-gray-600"
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
