import { Link, useLocation } from "react-router-dom";
import { Shield, Moon, Sun, LayoutDashboard, FileSearch } from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze", icon: FileSearch },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                AI SOC Analyst
              </p>
              <p className="text-sm font-semibold">Security Log Investigation</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
