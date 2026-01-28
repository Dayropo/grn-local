import { Button } from "@/components/ui/button"
import { Search, Loader2, FileText, Info } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const searchFormSchema = z.object({
  deliveryId: z.string().min(1, "Delivery ID is required"),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

export interface SearchFormProps {
  isLoading: boolean
  onSubmit: (values: SearchFormValues) => void
}

export const CreateGrnSearchForm: React.FC<SearchFormProps> = ({ isLoading, onSubmit }) => {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      deliveryId: "",
    },
  })

  return (
    <div className="h-full">
      <div className="rounded-xl border border-gray-100 bg-white px-4 pt-4 pb-8 shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="mb-6 text-center sm:text-left">
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <div className="bg-primary/10 rounded-lg p-1.5">
                <FileText className="text-primary size-5" />
              </div>
              <div className="text-lg font-bold text-gray-800">Create GRN</div>
            </div>
            <p className="my-2 text-sm text-gray-600">
              Enter the <span className="text-primary font-semibold">GTN ID</span> linked to your
              delivery to view and confirm the transfer details.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100/50 bg-linear-to-r from-blue-50 via-indigo-50/50 to-blue-50 p-4 sm:p-6">
            <div className="space-y-4 py-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mx-auto flex max-w-2xl items-end justify-center gap-3"
                >
                  <FormField
                    control={form.control}
                    name="deliveryId"
                    render={({ field }) => (
                      <FormItem className="max-w-xs flex-1">
                        <FormControl>
                          <Input
                            placeholder="e.g. 44415"
                            disabled={isLoading}
                            autoFocus
                            className="h-10 bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="h-10 whitespace-nowrap"
                    type="submit"
                    disabled={isLoading || !form.watch("deliveryId").trim()}
                    aria-label="Search for delivery details"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="size-4" />
                        Search
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Info className="text-primary h-4 w-4" />
                <p>Tip: You can find the GTN ID in the Goods Delivery Note.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
