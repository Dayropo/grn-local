import { FoodCoLogo, LandingBackground } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { useLoginMutation } from "@/lib/api/auth"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { AlertCircle, ArrowLeftRight, Truck } from "lucide-react"

export const Route = createFileRoute("/grn-transfer/")({
  component: GrnTransferLanding,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string,
    }
  },
})

function GrnTransferLanding() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: "/grn-transfer/" })

  const { mutate: login, isPending, error } = useLoginMutation()

  const handleLogin = () => {
    login(undefined, {
      onSuccess: () => {
        if (redirect) navigate({ to: redirect })
        navigate({ to: "/grn-transfer/create-grn" })
      },
    })
  }

  return (
    <div className="h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
      <div className="flex h-full w-full flex-col items-center justify-center gap-12 lg:flex-row">
        {/* Left Section */}
        <div className="w-full lg:w-1/2">
          <div className="mx-auto w-full px-8 sm:w-4/5 sm:p-0">
            {/* Header */}
            <div className="space-y-2">
              <div className="mb-12">
                <img src={FoodCoLogo} alt="FoodCo Logo" className="max-w-xs" />
              </div>
              <h1 className="text-primary text-xl font-bold">Goods Received Note System</h1>
              <div className="text-primary text-sm">Create GRN & Monitor Incoming Stock</div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-in slide-in-from-left my-6 rounded-r-lg border-l-4 border-red-400 bg-red-50 p-4 duration-300">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Authentication Error</p>
                    <p className="text-sm text-red-600">
                      {(error as any)?.message || "Authentication failed. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Portal Selection */}
            <div className="mt-4 space-y-4">
              <h2 className="text-base font-semibold text-gray-700">Select Portal</h2>

              {/* Direct Supply Option */}
              {/* <Button
                onClick={() => navigate({ to: "/direct-supply/create-grn" })}
                className="h-[100px] w-full gap-4 text-left"
                size="lg"
              >
                <Truck className="size-8" />

                <div className="flex-1">
                  <h3 className="mb-1 text-base font-semibold text-white">Direct Supply</h3>
                  <div className="text-sm text-white">
                    Create GRN for goods received directly from suppliers
                  </div>
                </div>
              </Button> */}

              {/* Stock Transfer Option */}
              <Button
                // variant="outline"
                // className="border-primary h-[100px] w-full gap-4 text-left"
                className="h-[100px] w-full gap-4 text-left"
                size="lg"
                onClick={handleLogin}
                disabled={isPending}
              >
                <ArrowLeftRight className="size-8" />

                <div className="flex-1">
                  {/* <h3 className="text-primary mb-1 text-base font-semibold">Stock Transfer</h3>
                  <p className="text-secondary text-sm">
                    Record Goods received from SDC/Warehouse, CK & PPU
                  </p> */}

                  <h3 className="mb-1 text-base font-semibold">Stock Transfer</h3>
                  <p className="text-sm">Record Goods received from SCD/Warehouse, CK & PPU</p>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration Image */}
        <div className="hidden w-1/2 items-center justify-center lg:flex">
          <img
            src={LandingBackground}
            alt="Goods Received Illustration"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
