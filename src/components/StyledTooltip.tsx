import { Tooltip, TooltipProps } from "react-aria-components";

type Props = TooltipProps;

const StyledTooltip = (props: Props) => {
  return (
    <Tooltip
      className="rounded bg-gray-700 px-2.5 py-1.5 text-sm transition-opacity duration-75 data-[entering]:animate-fade-in data-[exiting]:animate-fade-out"
      {...props}
    >
      {props.children}
    </Tooltip>
  );
};

export default StyledTooltip;
