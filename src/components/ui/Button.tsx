import { ButtonProps, Button as RACButton } from "react-aria-components";
import { twMerge } from "tailwind-merge";

interface Props extends ButtonProps {
  className?: string;
}

const Button = ({ className, ...rest }: Props) => {
  return (
    <RACButton
      className={twMerge(
        "rounded border border-neutral-600 bg-neutral-700 px-2.5 py-1.5 text-sm hover:bg-neutral-600 focus:shadow-none focus:outline-none focus-visible:border-slate-400",
        className,
      )}
      {...rest}
    />
  );
};

export default Button;
