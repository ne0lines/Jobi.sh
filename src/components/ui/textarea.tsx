import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-app-stroke bg-white px-4 py-3.5 text-base font-normal text-app-ink outline-none transition placeholder:text-app-muted focus-visible:border-app-primary focus-visible:ring-2 focus-visible:ring-app-primary/20 disabled:cursor-not-allowed disabled:bg-white disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
