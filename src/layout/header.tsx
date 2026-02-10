import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { User } from "lucide-react"
import { PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function Header() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  console.log("user", user)

  return (
    <header className="bg-background sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-6">
      <SidebarTrigger />

      <div className="min-w-0 flex-1 text-center">
        <h1 className="text-primary truncate font-semibold tracking-tight">
          Goods Receipt Management Portal
        </h1>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 sm:gap-2"
            aria-label="User menu"
          >
            <div className="flex min-w-0 items-center gap-2">
              <User className="h-7 w-7 flex-shrink-0 rounded-full border border-gray-300 p-1 sm:h-8 sm:w-8" />
              <span className="hidden max-w-[150px] truncate text-sm font-medium sm:inline">
                {user?.username}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-600" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-72 rounded-lg border border-gray-200 bg-white p-0 shadow-lg"
        >
          <div className="flex flex-col items-center gap-3 p-6">
            <User className="h-16 w-16 rounded-full border-2 border-blue-100 bg-blue-50 p-3 text-[#034EA2]" />
            <div className="text-center">
              <div className="font-semibold text-gray-900">{user?.username}</div>
              {/* <div className="text-sm text-gray-500 mt-1">{user?.}</div> */}
            </div>
            <div className="w-full border-t border-gray-100 pt-2">
              {/* <LogoutComponent
                userName={user?.username}
                trigger={
                  <Button className="flex w-full items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                }
                onLogout={() => setOpen(false)}
              /> */}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  )
}
