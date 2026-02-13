import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Search } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

const searchFormSchema = z.object({
  deliveryId: z.string().optional(),
  sourceLocationName: z.string().optional(),
  destinationStore: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryStatusCode: z.string().optional(),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const grnStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "adjustment_requested", label: "Adjustment Requested" },
  { value: "rejected", label: "Rejected" },
]

interface ViewGrnSearchFormProps {
  onSubmit: (filters: {
    deliveryId?: number
    sourceLocationName?: string
    destinationStore?: string
    deliveryDate?: string
    deliveryStatusCode?: string
  }) => void
  isLoading: boolean
  error?: string | null
}

export const ViewGrnSearchForm: React.FC<ViewGrnSearchFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      deliveryId: "",
      sourceLocationName: "",
      destinationStore: "",
      deliveryDate: "",
      deliveryStatusCode: "",
    },
  })

  const handleDateSelect = (date: Date | undefined) => {
    form.setValue("deliveryDate", date ? format(date, "yyyy-MM-dd") : "")
    setIsDatePickerOpen(false)
  }

  const handleSubmit = (data: SearchFormValues) => {
    onSubmit({
      deliveryId: data.deliveryId ? parseInt(data.deliveryId) : undefined,
      sourceLocationName: data.sourceLocationName || undefined,
      destinationStore: data.destinationStore || undefined,
      deliveryDate: data.deliveryDate || undefined,
      deliveryStatusCode: data.deliveryStatusCode || undefined,
    })
  }

  return (
    <div className="space-y-4 rounded-xl bg-white p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">View GRNs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Search for delivery receipts created by stores to review and confirm
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Delivery ID Filter */}
            <FormField
              control={form.control}
              name="deliveryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Search by Delivery ID"
                      className="h-9"
                      disabled={isLoading}
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
                    <Input
                      placeholder="Search by Source Location"
                      className="h-9"
                      disabled={isLoading}
                      {...field}
                    />
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
                    <Input
                      placeholder="Search by Destination Store"
                      className="h-9"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date Filter */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
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

            {/* GRN Status Filter */}
            <FormField
              control={form.control}
              name="deliveryStatusCode"
              render={({ field }) => (
                <FormItem>
                  <Select
                    value={field.value || "all"}
                    onValueChange={value => field.onChange(value === "all" ? "" : value)}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select GRN status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {grnStatusOptions.map(option => (
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
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search GRNs
          </Button>
        </form>
      </Form>
    </div>
  )
}
