import { AuthBackground, FoodCoLogo, Partners } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"
import { useLoginMutation } from "@/utils/api/auth"

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
    <div className="p-0 m-0 flex flex-col lg:flex-row w-full min-h-screen">
      {/* Left Side */}
      <div className="flex w-full lg:w-1/2 h-screen flex-col justify-center items-center bg-white px-4 lg:px-16 py-8">
        <div className="w-full max-w-md">
          {/* Logo and Brand Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src={FoodCoLogo}
                alt="Food Concept Logo"
                className="h-16 lg:h-20 object-contain mx-auto"
              />
            </div>
            <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
              <img
                src={Partners}
                alt="Partner Brands"
                className="h-6 lg:h-8 object-contain mx-auto"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-in slide-in-from-left duration-300">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-red-800 font-medium text-sm">Authentication Error</p>
                  <p className="text-red-600 text-sm">
                    {(error as any)?.message || "Authentication failed. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Portal Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Portal</h3>
              <p className="text-gray-600 text-sm">Choose your module to continue</p>
            </div>

            <div className="space-y-4">
              {/* Goods Receipt Management Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleLogin}
                disabled={isPending}
              >
                Sign In to Goods Receipt Management
              </Button>

              {/* Weighted Average Cost Portal Button */}
              <Button size="lg" className="w-full h-14 text-lg">
                Sign In to Weighted Average Cost Portal
              </Button>
            </div>

            {/* Security Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                🔒 Secured with Microsoft Azure Active Directory
                <br />© 2025 Food Cocepts plc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="fixed w-auto h-auto overflow-hidden right-0 hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-l from-transparent to-white/20 z-10"></div>
        <img
          src={AuthBackground}
          alt="Decorative Graphic"
          className="w-auto h-screen object-cover object-center filter brightness-110 contrast-105"
        />

        {/* Subtle overlay pattern */}
        <div
          className="absolute inset-0 opacity-5 z-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
    </div>
  )
}
