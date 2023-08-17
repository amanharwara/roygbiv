import { ParentComponent } from "solid-js";

export const VisuallyHidden: ParentComponent = (props) => {
  return (
    <span class="border-0 h-px -m-px overflow-hidden p-0 absolute whitespace-nowrap w-px [clip:rect(0_0_0_0)]">
      {props.children}
    </span>
  );
};
