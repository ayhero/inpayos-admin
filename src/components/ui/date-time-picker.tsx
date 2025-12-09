import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DateTimePickerProps {
  value?: string // datetime-local format string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "选择日期时间",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      return new Date(value)
    }
    return undefined
  })
  const [time, setTime] = React.useState<string>(() => {
    if (value) {
      const d = new Date(value)
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      return `${h}:${m}:${s}`
    }
    return "00:00:00"
  })

  React.useEffect(() => {
    if (value) {
      const d = new Date(value)
      setDate(d)
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
  }, [value])

  const updateDateTime = (newDate?: Date, newTime?: string) => {
    const dateToUse = newDate || date
    const timeToUse = newTime !== undefined ? newTime : time
    
    if (!dateToUse) return

    const year = dateToUse.getFullYear()
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0')
    const day = String(dateToUse.getDate()).padStart(2, '0')
    const formattedValue = `${year}-${month}-${day}T${timeToUse}`
    
    onChange?.(formattedValue)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      updateDateTime(selectedDate, undefined)
      setOpen(false)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    updateDateTime(undefined, newTime)
  }

  const displayValue = date 
    ? `${format(date, "yyyy-MM-dd")} ${time}`
    : ""

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step="1"
        value={time}
        onChange={handleTimeChange}
        className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  )
}
