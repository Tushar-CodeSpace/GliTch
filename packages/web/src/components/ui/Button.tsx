import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function Button({ variant = "primary", className, children, ...props }: Props) {
  return (
    <button className={cn("button", `button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
