
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Clock, CheckSquare, FileText, MessageSquare,
  Bell, Megaphone, Calendar, LogOut, Zap, Users, BarChart3,
  Settings, Globe, BookOpen, ChevronLeft, Menu
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NavItem { href: string; label: string; icon: React.ElementType; }

const employeeNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/dashboard/reports", label: "Work Reports", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/leave", label: "Leave Requests", icon: Calendar },
];

const ownerNav: NavItem[] = [
  { href: "/owner", label: "Overview", icon: LayoutDashboard },
  { href: "/owner/employees", label: "Employees", icon: Users },
  { href: "/owner/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/owner/reports", label: "Reports", icon: FileText },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/owner/messages", label: "Messages", icon: MessageSquare },
  { href: "/owner/announcements", label: "Announcements", icon: Megaphone },
  { href: "/owner/leave", label: "Leave Requests", icon: Calendar },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Website Content", icon: Globe },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/seo", label: "SEO Settings", icon: Settings },
  { href: "/admin/users", label: "All Users", icon: Users },
  { href: "/admin/activity", label: "Activity Logs", icon: BarChart3 },
];

interface SidebarProps {
  role: "employee" | "owner" | "super_admin";
  userName: string;
  userAvatar?: string | null;
}

export function Sidebar({ role, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  const nav = role === "super_admin" ? adminNav : role === "owner" ? ownerNav : employeeNav;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Signed out successfully");
  };

  return (
    <aside className={cn(
      "flex flex-col bg-slate-900 text-white transition-all duration-300 min-h-screen",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Fast Digital 360</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5" />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white ml-auto">
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && href !== "/owner" && href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-slate-400 capitalize">{role.replace("_", " ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
