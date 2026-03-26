"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type LoaderProps = {
  className?: string;
  size?: number;
};

export function Loader({ className, size = 48 }: Readonly<LoaderProps>) {
  return (
    <span
      aria-hidden="true"
      className={cn("app-loader", className)}
      style={{ "--loader-size": `${size}px` } as CSSProperties}
    />
  );
}