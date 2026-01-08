import { FoodCoLogo } from "@/assets/images"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { Archive, ChevronRight, LogOut, PackageCheck, type LucideIcon } from "lucide-react"
import React from "react"

type items = Array<{
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: Array<{ title: string; url: string }>
}>

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems: items = [
    {
      title: "Direct Supply",
      url: "#",
      icon: PackageCheck,
      isActive: true,
      items: [
        {
          title: "Create GRN",
          url: "/direct-supply/create-grn",
        },
        {
          title: "Store History",
          url: "/direct-supply/store-history",
        },
        {
          title: "e-GRN Report",
          url: "/direct-supply/egrn-report",
        },
      ],
    },
    {
      title: "Stock Movement",
      url: "#",
      icon: Archive,
      items: [
        {
          title: "Search e-GTN",
          url: "/stock-movement/search-egtn",
        },
        // {
        //   title: "Create e-GRN",
        //   url: "/stock-movement/create-egrn",
        // },
        {
          title: "Store History",
          url: "/stock-movement/store-history",
        },
      ],
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-3 bg-white w-full flex items-center justify-center rounded-lg">
          <img src={FoodCoLogo} alt="" className="h-12" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map(item => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon className="size-4" />
                      <span className="font-semibold">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
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
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="outline" size="lg" className="text-destructive">
          <LogOut />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
