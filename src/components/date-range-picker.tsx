import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange: (date?: Date) => void
  onEndDateChange: (date?: Date) => void
  placeholder?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
    }
    if (startDate) {
      return `${format(startDate, "MMM dd, yyyy")} - `
    }
    return placeholder
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-2 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Start Date</p>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              disabled={date => (endDate ? date > endDate : false)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">End Date</p>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              disabled={date => (startDate ? date < startDate : false)}
            />
          </div>
        </div>
        <div className="flex gap-2 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onStartDateChange(undefined)
              onEndDateChange(undefined)
            }}
            className="flex-1"
          >
            Clear
          </Button>
          <Button size="sm" onClick={() => setIsOpen(false)} className="flex-1">
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
