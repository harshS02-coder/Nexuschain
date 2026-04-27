import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Truck,
  Globe,
  Route,
  Bell,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Shipments", href: "/shipments", icon: Truck },
  { label: "Network", href: "/network", icon: Globe },
  { label: "Routes", href: "/routes", icon: Route },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-stone-800 bg-stone-900 sticky top-0 h-screen">
        <div className="p-6 border-b border-stone-800">
          <Link to="/" className="text-xl font-serif tracking-tight text-amber-50">
            NexusChain
          </Link>
          <p className="text-xs text-stone-500 mt-1">Supply Chain Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-amber-900/20 text-amber-300 border border-amber-900/30"
                    : "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center">
                <User size={14} className="text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                <p className="text-xs text-stone-500 truncate">{user.email || ""}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200"
            >
              <User size={16} />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-serif tracking-tight text-amber-50">
          NexusChain
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-stone-300 hover:bg-stone-800"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-stone-950 pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-amber-900/20 text-amber-300"
                      : "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-stone-800 mt-4">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-stone-400 hover:text-stone-100"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-stone-400 hover:text-stone-100"
                >
                  <User size={18} />
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-0 mt-14 lg:mt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
