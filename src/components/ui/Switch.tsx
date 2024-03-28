import {
  Switch as RacSwitch,
  type SwitchProps as RacSwitchProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface SwitchProps extends Omit<RacSwitchProps, "children" | "className"> {
  children: React.ReactNode;
  className?: string;
}

function Switch({ children, className, ...props }: SwitchProps) {
  return (
    <RacSwitch
      className={twMerge("group flex items-center gap-2", className)}
      {...props}
    >
      <div className="relative h-6 w-[2.65rem] rounded-xl border border-neutral-600 transition-all duration-75 before:absolute before:left-1 before:top-1/2 before:block before:h-4 before:w-4 before:-translate-y-1/2 before:rounded-full before:bg-neutral-500 before:transition-all before:duration-75 group-data-[selected]:bg-neutral-600 group-data-[selected]:before:translate-x-full group-data-[selected]:before:bg-neutral-400" />
      {children}
    </RacSwitch>
  );
}

export default Switch;
