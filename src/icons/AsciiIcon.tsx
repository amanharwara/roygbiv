import { ComponentPropsWithoutRef, FC } from "react";

const AsciiIcon: FC<ComponentPropsWithoutRef<"svg">> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
      <path
        fill="currentColor"
        d="M18.25 25H9V7h8.5a5.25 5.25 0 0 1 4 8.65A5.25 5.25 0 0 1 18.25 25ZM12 22h6.23a2.25 2.25 0 1 0 0-4.5H12Zm0-7.5h5.5a2.25 2.25 0 1 0 0-4.5H12Z"
      />
    </svg>
  );
};

export default AsciiIcon;
