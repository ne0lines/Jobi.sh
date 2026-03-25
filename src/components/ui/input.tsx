import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base font-normal text-app-ink outline-none transition placeholder:text-app-muted focus-visible:border-app-primary focus-visible:ring-2 focus-visible:ring-app-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-white disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-app-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
