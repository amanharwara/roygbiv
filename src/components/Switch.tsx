import {
  Switch as RacSwitch,
  type SwitchProps as RacSwitchProps,
} from "react-aria-components";

interface SwitchProps extends Omit<RacSwitchProps, "children"> {
  children: React.ReactNode;
}

function Switch({ children, ...props }: SwitchProps) {
  return (
    <RacSwitch className="group flex items-center gap-2" {...props}>
      <div className="h-6 w-[2.65rem] rounded-xl border border-neutral-600 transition-all duration-75 before:mx-[0.25rem] before:my-[0.165rem] before:block before:h-4 before:w-4 before:rounded-full before:bg-neutral-500 before:transition-all before:duration-75 group-data-[selected]:bg-neutral-600 group-data-[selected]:before:translate-x-full group-data-[selected]:before:bg-neutral-400" />
      {children}
    </RacSwitch>
  );
}

export default Switch;
