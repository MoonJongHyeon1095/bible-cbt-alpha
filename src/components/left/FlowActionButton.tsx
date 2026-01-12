import type { ComponentProps } from "react";
import { Button } from "../ui/button";

type Props = ComponentProps<typeof Button> & {
  label: string;
};

export function FlowActionButton({ label, className, ...rest }: Props) {
  return (
    <Button
      {...rest}
      className={`w-full bg-emerald-600 text-white shadow-lg py-5 text-base hover:bg-emerald-700 ${className ?? ""}`}
    >
      {label}
    </Button>
  );
}
