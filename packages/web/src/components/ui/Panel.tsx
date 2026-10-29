import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Panel({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <section className={cn("panel", className)} {...props}>{children}</section>;
}
