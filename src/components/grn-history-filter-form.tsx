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
  deliveryDate: z.string().optional(),
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
      deliveryDate: "",
      deliveryStatusCode: "",
      deliveryTypeCode: "",
      salesOrderReference: "",
    },
  })

  React.useEffect(() => {
    if (resetTrigger !== undefined) {
      form.reset()
    }
  }, [resetTrigger, form])

  const handleDateSelect = (date: Date | undefined) => {
    form.setValue("deliveryDate", date ? format(date, "yyyy-MM-dd") : "")
    setIsDatePickerOpen(false)
  }

  React.useEffect(() => {
    const subscription = form.watch(values => {
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

          {/* Source Location ID Filter */}
          {/* <FormField
            control={form.control}
            name="sourceLocationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Location ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Source Location ID"
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
          /> */}

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

          {/* Delivery Date Filter */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-start text-left font-normal">
                <Calendar className="mr-2 size-4" />
                {(() => {
                  const date = form.getValues("deliveryDate")
                  if (date) {
                    return format(new Date(date), "LLL dd, y")
                  }
                  return <span>Pick a date</span>
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={(() => {
                  const date = form.getValues("deliveryDate")
                  return date ? new Date(date) : undefined
                })()}
                onSelect={handleDateSelect}
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
          <FormField
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
          />

          {/* Sales Order Reference Filter */}
          {/* <FormField
            control={form.control}
            name="salesOrderReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Order Reference</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Sales Order Reference"
                    className="h-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
      </form>
    </Form>
  )
}
