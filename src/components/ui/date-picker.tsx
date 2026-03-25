"use client";

import { format, isValid, parse } from "date-fns";
import { sv } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

function parseDateValue(value: string) {
  if (!value) {
    return undefined;
  }

  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function DatePicker({
  className,
  onChange,
  placeholder = "Välj datum",
  value,
}: Readonly<DatePickerProps>) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!selectedDate}
            className={cn(
              "mt-2 h-14 w-full justify-start rounded-2xl border-app-stroke bg-white px-4 text-left text-base font-normal text-app-ink shadow-none data-[empty=true]:text-app-muted focus-visible:border-app-primary focus-visible:ring-app-primary/20",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-app-muted" />
        {selectedDate ? format(selectedDate, "PPP", { locale: sv }) : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          locale={sv}
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}