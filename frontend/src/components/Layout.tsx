import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              AI SOC Analyst
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Security Log Investigation
            </h1>
          </div>

          <nav className="flex gap-2">
            <NavLink to="/" label="Upload Logs" active={location.pathname === "/"} />
            <NavLink
              to="/results"
              label="Analysis Results"
              active={location.pathname === "/results"}
            />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function NavLink({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}
