import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useLogoutMutation } from "@/lib/api/auth"
import { useState } from "react"
import {
  User,
  LogOut,
  ChevronDown,
  Mail,
  Shield,
  FileText,
  History,
  FileBarChart,
} from "lucide-react"
import { PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

const allNavLinks: Array<{ title: string; url: string; icon: LucideIcon; allowedRoles: string[] }> =
  [
    {
      title: "View GRN",
      url: "/grn-transfer/view-grn",
      icon: FileText,
      allowedRoles: ["SCD_Team"],
    },
    {
      title: "Create GRN",
      url: "/grn-transfer/create-grn",
      icon: FileText,
      allowedRoles: ["Restaurant_Manager"],
    },
    {
      title: "GRN History",
      url: "/grn-transfer/grn-history",
      icon: History,
      allowedRoles: ["Restaurant_Manager"],
    },
    {
      title: "Store Report",
      url: "/grn-transfer/store-report",
      icon: FileBarChart,
      allowedRoles: ["Finance"],
    },
  ]

export default function Header() {
  const { user, getRoles } = useAuth()
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const allRoles = getRoles()
  const roles = allRoles.filter(
    r => r.toLowerCase() !== "signatories" && r.toLowerCase() !== "accounts_payable",
  )
  const userRolesLower = allRoles.map(r => r.toLowerCase())

  const navLinks = allNavLinks.filter(link =>
    link.allowedRoles.some(role => userRolesLower.includes(role.toLowerCase())),
  )

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setOpen(false)
        navigate({
          to: "/grn-transfer",
          search: { redirect: window.location.pathname },
        })
      },
    })
  }

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
            className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 sm:gap-2"
            aria-label="User menu"
          >
            <div className="flex min-w-0 items-center gap-2">
              <User className="h-7 w-7 flex-shrink-0 rounded-full border border-gray-300 p-1 sm:h-8 sm:w-8" />
              <span className="hidden max-w-[150px] truncate text-sm font-medium sm:inline">
                {user?.name}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-600" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-80 rounded-lg border border-gray-200 bg-white p-0 shadow-lg"
        >
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <User className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-blue-100 bg-blue-50 p-2.5 text-[#034EA2]" />
              <div className="min-w-0">
                <div className="truncate font-semibold text-gray-900">{user?.name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate" title={user?.username}>
                    {user?.username}
                  </span>
                </div>
                {roles.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {roles.map(role => (
                      <span
                        key={role}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 capitalize"
                      >
                        {role.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {navLinks.length > 0 && (
              <div className="space-y-1 border-t border-gray-100 pt-3">
                {navLinks.map(link => (
                  <Link
                    key={link.url}
                    to={link.url}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <link.icon className="h-4 w-4 text-gray-400" />
                    {link.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-3">
              <Button
                className="flex w-full items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  )
}
