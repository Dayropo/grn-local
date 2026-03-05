import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

const filterFormSchema = z.object({
  deliveryId: z.string().optional(),
  sourceLocationId: z.string().optional(),
  sourceLocationName: z.string().optional(),
  destinationStore: z.string().optional(),
  deliveryDateFrom: z.string().optional(),
  deliveryDateTo: z.string().optional(),
  deliveryStatusCode: z.string().optional(),
  deliveryTypeCode: z.string().optional(),
  salesOrderReference: z.string().optional(),
})

type FilterFormValues = z.infer<typeof filterFormSchema>

export interface GrnHistoryFilterFormProps {
  onSubmit: (values: FilterFormValues) => void
  resetTrigger?: number
}

const deliveryStatusOptions = [
  { value: "1", label: "Open" },
  { value: "2", label: "In Process" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Cancelled" },
]

const deliveryTypeOptions = [
  { value: "STOD", label: "Store to Distribution Center" },
  { value: "STOS", label: "Store to Store" },
]

export const GrnHistoryFilterForm: React.FC<GrnHistoryFilterFormProps> = ({
  onSubmit,
  resetTrigger,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      deliveryId: "",
      sourceLocationId: "",
      sourceLocationName: "",
      destinationStore: "",
      deliveryDateFrom: "",
      deliveryDateTo: "",
      deliveryStatusCode: "",
      deliveryTypeCode: "",
      salesOrderReference: "",
    },
  })

  React.useEffect(() => {
    if (resetTrigger !== undefined) {
      form.reset({
        deliveryId: "",
        sourceLocationId: "",
        sourceLocationName: "",
        destinationStore: "",
        deliveryDateFrom: "",
        deliveryDateTo: "",
        deliveryStatusCode: "",
        deliveryTypeCode: "",
        salesOrderReference: "",
      })
    }
  }, [resetTrigger, form])

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      form.setValue("deliveryDateFrom", "")
      form.setValue("deliveryDateTo", "")
      return
    }

    const sameDay = range.from && range.to && range.from.getTime() === range.to.getTime()

    form.setValue("deliveryDateFrom", format(range.from, "yyyy-MM-dd"))
    form.setValue("deliveryDateTo", sameDay ? "" : range.to ? format(range.to, "yyyy-MM-dd") : "")

    if (range?.from && range?.to && !sameDay) {
      setIsDatePickerOpen(false)
    }
  }

  const deliveryDateFrom = form.watch("deliveryDateFrom")
  const deliveryDateTo = form.watch("deliveryDateTo")

  React.useEffect(() => {
    const subscription = form.watch(values => {
      const hasDateFrom = values.deliveryDateFrom
      const hasDateTo = values.deliveryDateTo
      const hasPartialDateRange = (hasDateFrom && !hasDateTo) || (!hasDateFrom && hasDateTo)

      if (hasPartialDateRange) {
        return
      }

      onSubmit(values as FilterFormValues)
    })
    return () => subscription.unsubscribe()
  }, [form, onSubmit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Delivery ID Filter */}
          <FormField
            control={form.control}
            name="deliveryId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Search by GTN Number"
                    className="h-9"
                    {...field}
                    onChange={event => {
                      const numericValue = event.target.value.replace(/\D/g, "")
                      field.onChange(numericValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source Location Name Filter */}
          <FormField
            control={form.control}
            name="sourceLocationName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Search by Source Location Name" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Destination Store Filter */}
          <FormField
            control={form.control}
            name="destinationStore"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Search by Destination Store" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Date Range Filter */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-start text-left font-normal">
                <Calendar className="mr-2 size-4" />
                {(() => {
                  const from = form.getValues("deliveryDateFrom")
                  const to = form.getValues("deliveryDateTo")
                  if (from && to) {
                    return `${format(new Date(from), "LLL dd, y")} - ${format(new Date(to), "LLL dd, y")}`
                  }
                  if (from) {
                    return `From ${format(new Date(from), "LLL dd, y")}`
                  }
                  return <span>Pick a date range</span>
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                defaultMonth={deliveryDateFrom ? new Date(deliveryDateFrom) : undefined}
                selected={{
                  from: deliveryDateFrom ? new Date(deliveryDateFrom) : undefined,
                  to: deliveryDateTo ? new Date(deliveryDateTo) : undefined,
                }}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Delivery Status Filter */}
          <FormField
            control={form.control}
            name="deliveryStatusCode"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value || "all"}
                  onValueChange={value => field.onChange(value === "all" ? "" : value)}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select delivery status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Delivery Statuses</SelectItem>
                    {deliveryStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Type Filter */}
          {/* <FormField
            control={form.control}
            name="deliveryTypeCode"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value || "all"}
                  onValueChange={value => field.onChange(value === "all" ? "" : value)}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select delivery type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Delivery Types</SelectItem>
                    {deliveryTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
      </form>
    </Form>
  )
}
