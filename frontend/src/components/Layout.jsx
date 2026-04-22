import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Activity,
  Shield,
  Building2,
  Eye,
  Map,
  LayoutDashboard,
  Bell,
  BarChart3,
  Upload,
  Brain,
  Send,
  FileText,
  ClipboardList,
  Table,
  LineChart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-primary",
    nav: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { label: "Hospitals", path: "/admin/hospitals", icon: Building2 },
      { label: "Alerts", path: "/admin/alerts", icon: Bell },
      { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      { label: "Federated Learning", path: "/admin/federated", icon: Brain },
      { label: "Model Performance", path: "/admin/model-performance", icon: LineChart },
      { label: "User Management", path: "/admin/users", icon: Users },
      { label: "Reports & Export", path: "/admin/reports", icon: FileText },
      { label: "System Logs", path: "/admin/system-logs", icon: ClipboardList },
    ],
  },
  hospital: {
    label: "Hospital",
    icon: Building2,
    color: "text-accent",
    nav: [
      { label: "Dashboard", path: "/hospital", icon: LayoutDashboard },
      { label: "Upload Data", path: "/hospital/upload", icon: Upload },
      { label: "Train Model", path: "/hospital/train", icon: Brain },
      { label: "Model Updates", path: "/hospital/updates", icon: Send },
      { label: "Data History", path: "/hospital/data-history", icon: Table },
      { label: "Training History", path: "/hospital/training-history", icon: ClipboardList },
      { label: "Model Performance", path: "/hospital/model-performance", icon: LineChart },
    ],
  },
  official: {
    label: "Health Official",
    icon: Eye,
    color: "text-success",
    nav: [
      { label: "Dashboard", path: "/official", icon: LayoutDashboard },
      { label: "Alerts", path: "/official/alerts", icon: Bell },
      { label: "Heatmap", path: "/official/heatmap", icon: Map },
      { label: "Analytics", path: "/official/analytics", icon: BarChart3 },
      { label: "AI Prediction", path: "/official/prediction", icon: Brain },
      { label: "Reports", path: "/official/reports", icon: FileText },
    ],
  },
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentRole = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/hospital")
    ? "hospital"
    : "official";

  const config = roleConfig[currentRole];
  const RoleIcon = config.icon;

  const handleNotificationClick = () => {
    if (currentRole === "admin") {
      navigate("/admin/alerts");
      return;
    }

    if (currentRole === "official") {
      navigate("/official/alerts");
      return;
    }

    navigate("/hospital/updates");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-[24%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground 
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Auralis
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">
                Disease Surveillance
              </p>
            </div>
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent">
            <RoleIcon className={`w-4 h-4 ${config.color}`} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {config.label}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {config.nav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full
              text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border/70 bg-card/75 backdrop-blur-xl flex items-center px-4 lg:px-8 gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <ThemeToggle className="h-8 w-8" />
            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative rounded-md p-1 hover:bg-accent"
              aria-label="Open notifications"
              title="Open notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
