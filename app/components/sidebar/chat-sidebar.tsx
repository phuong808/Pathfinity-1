"use client"

import * as React from "react"
import { Infinity, MessagesSquare, Map, GraduationCap, Briefcase, User, Plus } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { ChatHistory } from "./chat-history"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "../ui/sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Chat",
            url: "/Chat",
            icon: MessagesSquare,
        },
        {
            title: "Roadmap",
            url: "/Roadmap",
            icon: Map,
        },
        {
            title: "Majors",
            url: "/Majors",
            icon: GraduationCap,
        },
        {
            title: "Careers",
            url: "/Careers",
            icon: Briefcase,
        },
        {
            title: "People",
            url: "/People",
            icon: User,
        }
    ],
}



export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession()
    const router = useRouter()
    const { state, isMobile } = useSidebar()

    const user = session?.user
        ? {
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.image ?? "/avatars/default.jpg",
        }
        : null

    return (
        <>
          <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="position-absolute top-0 left-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
                    <a href="/">
                      <Infinity className="h-5 w-5" />
                      <span className="text-base font-semibold">Pathfinity</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <NavMain items={data.navMain} />
              <ChatHistory userId={session?.user?.id} />
            </SidebarContent>

            <SidebarFooter>
              <NavUser user={user} />
            </SidebarFooter>
          </Sidebar>

          <SidebarTrigger
            className={`fixed top-0 z-10 transition-[left] duration-200 ease-in-out ${
              isMobile ? "top-4 left-4" : state === "collapsed" ? "left-[3rem]" : "left-[var(--sidebar-width)]"
            }`}
          />
        </>

    )
}