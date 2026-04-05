import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { UsersService } from "@/client"
import { Footer } from "@/components/Common/Footer"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async ({ context }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }

    // Validate token server-side by fetching the current user
    try {
      await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: UsersService.readUserMe,
      })
    } catch {
      // Token is invalid/expired - clear it and redirect to login
      localStorage.removeItem("access_token")
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 text-muted-foreground/60 hover:text-foreground transition-colors duration-200" />
        </header>
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-6xl page-enter">
            <Outlet />
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
