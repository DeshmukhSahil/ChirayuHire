import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { 
  Briefcase, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/src/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userData } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Jobs", icon: Briefcase, path: "/jobs" },
    { name: "Applications", icon: Users, path: "/applications" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-bottom">
          <h1 className="text-xl font-bold tracking-tight">Chirayu Hire <span className="text-muted-foreground font-mono text-sm">v1.0</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData?.photoURL || user?.photoURL || undefined} />
              <AvatarFallback>{(userData?.displayName || user?.displayName || "U").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userData?.displayName || user?.displayName || "User"}</span>
              <span className="text-xs text-muted-foreground capitalize">{userData?.role || (user ? "recruiter" : "")}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={() => auth.signOut()}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4 w-1/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search candidates, jobs..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button className="md:hidden" variant="ghost" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
