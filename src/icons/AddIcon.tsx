import { ComponentPropsWithoutRef, FC } from "react";

const AddIcon: FC<ComponentPropsWithoutRef<"svg">> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z" />
    </svg>
  );
};

export default AddIcon;
