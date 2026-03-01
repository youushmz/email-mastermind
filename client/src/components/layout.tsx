import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0 z-10">
          <header className="flex items-center h-16 px-6 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors mr-4" />
          </header>
          
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
