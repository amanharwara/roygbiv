import { ReactNode } from "react";
import {
  TextField as RacTextField,
  TextFieldProps,
  Label,
  Input,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface Props extends TextFieldProps {
  label: NonNullable<ReactNode>;
  srOnlyLabel?: boolean;
  className?: string;
}

const TextField = ({ label, className, srOnlyLabel, ...props }: Props) => {
  return (
    <RacTextField
      className={twMerge("group flex flex-col gap-1", className)}
      {...props}
    >
      <Label className={srOnlyLabel ? "sr-only" : ""}>{label}</Label>
      <Input className="rounded border border-neutral-600 bg-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-slate-400" />
    </RacTextField>
  );
};

export default TextField;
