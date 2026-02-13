import { FoodCoLogo } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useLogoutMutation } from "@/lib/api/auth"
import { useAuth } from "@/hooks/use-auth"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import {
  Archive,
  ChevronRight,
  FileBarChart,
  FileText,
  History,
  LogOut,
  PackageCheck,
  type LucideIcon,
} from "lucide-react"
import React from "react"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  allowedRoles?: string[]
  items?: Array<{ title: string; url: string }>
}

const allNavItems: NavItem[] = [
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

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const { getRoles } = useAuth()

  const userRoles = getRoles().map(r => r.toLowerCase())

  const navItems = allNavItems.filter(item => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true
    return item.allowedRoles.some(role => userRoles.includes(role.toLowerCase()))
  })

  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate({
          to: "/grn-transfer",
          search: {
            redirect: window.location.pathname,
          },
        })
      },
    })
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center justify-center rounded-lg bg-white p-3">
          <img src={FoodCoLogo} alt="" className="h-12" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Stock Movement</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(item => {
              const hasItems = item.items && item.items.length > 0
              const isActive =
                location.pathname === item.url || location.pathname.startsWith(item.url + "/")

              if (hasItems) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive || isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          <item.icon className="size-4" />
                          <span className="font-semibold">{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map(subItem => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === subItem.url}
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="outline"
          size="lg"
          className="text-destructive"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          <LogOut />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
