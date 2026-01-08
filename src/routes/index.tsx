import { FoodCoLogo, LandingBackground } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeftRight, Truck } from "lucide-react"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 ">
      <div className="mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="w-4/5 mx-auto">
            {/* Header */}
            <div className="space-y-2 ">
              <div className=" mb-12">
                <img
                  src={FoodCoLogo}
                  alt="FoodCo Logo"
                  className="max-w-sm"
                />
              </div>
              <h1 className="text-xl font-bold text-primary">Goods Received Note System</h1>
              <div className="text-primary text-sm ">Create GRN & Monitor Incoming Stock</div>
            </div>

            {/* Portal Selection */}
            <div className="space-y-4  mt-4">
              <h2 className="text-base font-semibold text-gray-700">Select Portal</h2>

              {/* Direct Supply Option */}
              <Button
                //onClick={() => navigate("/direct-supply/create")}
                className="w-full gap-4 h-[100px] text-left"
                size="lg"
              >
                <Truck className="size-8" />

                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1 text-white">Direct Supply</h3>
                  <div className="text-sm text-white">
                    Create GRN for goods received directly from suppliers
                  </div>
                </div>
              </Button>

              {/* Stock Transfer Option */}
              <Button
                //onClick={() => navigate("/stock-transfer/create")}
                variant="outline"
                className="w-full gap-4 h-[100px] text-left border-primary"
                size="lg"
              >
                <ArrowLeftRight className="size-8 text-primary" />

                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1 text-primary">Stock Transfer</h3>
                  <p className="text-sm text-secondary">
                    Record Goods received from SDC/Warehouse, CK & PPU
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Right Section - Illustration Image */}
          <div className="flex items-center justify-center">
            <img
              src={LandingBackground}
              alt="Goods Received Illustration"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
