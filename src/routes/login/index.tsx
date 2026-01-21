import { AuthBackground, FoodCoLogo, Partners } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"
import { useLoginMutation } from "@/lib/api/auth"

export const Route = createFileRoute("/login/")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "/direct-supply/create-grn",
    }
  },
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: "/login/" })

  const { mutate: login, isPending, error } = useLoginMutation()

  const handleLogin = () => {
    login(undefined, {
      onSuccess: () => {
        navigate({ to: redirect })
      },
    })
  }

  return (
    <div className="m-0 flex min-h-screen w-full flex-col p-0 lg:flex-row">
      {/* Left Side */}
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-4 py-8 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo and Brand Section */}
          <div className="mb-12 space-y-6 text-center">
            <div className="transform transition-transform duration-300 hover:scale-105">
              <img
                src={FoodCoLogo}
                alt="Food Concept Logo"
                className="mx-auto h-16 object-contain lg:h-20"
              />
            </div>
            <div className="opacity-80 transition-opacity duration-300 hover:opacity-100">
              <img
                src={Partners}
                alt="Partner Brands"
                className="mx-auto h-6 object-contain lg:h-8"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-in slide-in-from-left mb-6 rounded-r-lg border-l-4 border-red-400 bg-red-50 p-4 duration-300">
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Select Portal</h3>
              <p className="text-sm text-gray-600">Choose your module to continue</p>
            </div>

            <div className="space-y-4">
              {/* Goods Receipt Management Button */}
              <Button
                size="lg"
                className="h-14 w-full text-lg rounded-md"
                onClick={handleLogin}
                disabled={isPending}
              >
                Sign In to Goods Receipt Management
              </Button>

              {/* Weighted Average Cost Portal Button */}
              <Button size="lg" className="h-14 w-full text-lg">
                Sign In to Weighted Average Cost Portal
              </Button>
            </div>

            {/* Security Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs leading-relaxed text-gray-500">
                🔒 Secured with Microsoft Azure Active Directory
                <br />© 2025 Food Cocepts plc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="fixed right-0 hidden h-auto w-auto overflow-hidden lg:block">
        <div className="absolute inset-0 z-10 bg-linear-to-l from-transparent to-white/20"></div>
        <img
          src={AuthBackground}
          alt="Decorative Graphic"
          className="h-screen w-auto object-cover object-center brightness-110 contrast-105 filter"
        />

        {/* Subtle overlay pattern */}
        <div
          className="absolute inset-0 z-5 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
    </div>
  )
}
