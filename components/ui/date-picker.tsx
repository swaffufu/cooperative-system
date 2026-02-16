"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  setDate?: (date: Date) => void
  onSelect?: (date?: Date) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({ date, setDate, onSelect, disabled = false, placeholder = "Pick a date" }: DatePickerProps) {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (setDate && selectedDate) {
      setDate(selectedDate)
    }
    if (onSelect) {
      onSelect(selectedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
