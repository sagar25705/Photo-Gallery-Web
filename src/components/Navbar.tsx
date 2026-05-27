import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Upload, LogOut, User as UserIcon, Shield, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/categories", label: "Categories" },
  { to: "/photographers", label: "Photographers" },
  { to: "/collections", label: "Collections" },
];

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-[oklch(0.85_0.15_150/0.1)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-[var(--gradient-mint)] grid place-items-center glow-mint">
              <Camera className="size-5 text-[var(--deep)]" />
            </div>
            <span className="text-xl font-bold text-gradient-mint">PicZio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors relative
                  after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5
                  after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                activeProps={{ className: "text-primary after:scale-x-100" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={onSearch} className="hidden lg:flex flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search photos, wildlife, landscapes…"
                className="w-full rounded-full glass pl-9 pr-4 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm" className="hidden sm:inline-flex rounded-full">
                  <Link to="/upload"><Upload className="size-4 mr-1" />Upload</Link>
                </Button>
                <div className="relative">
                  <button
                    onClick={() => setOpen((v) => !v)}
                    className="size-9 rounded-full overflow-hidden border border-primary/40 glow-mint"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full grid place-items-center bg-[var(--gradient-mint)] text-[var(--deep)] text-sm font-bold">
                        {(profile?.name ?? user.email ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 shadow-2xl">
                      <Link to="/profile/$username" params={{ username: profile?.username ?? "me" }} onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10">
                        <UserIcon className="size-4" /> My Profile
                      </Link>
                      <Link to="/saved" onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10">
                        <Camera className="size-4" /> Saved Photos
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10">
                          <Shield className="size-4" /> Admin
                        </Link>
                      )}
                      <button onClick={() => { setOpen(false); signOut(); navigate({ to: "/" }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/15 text-destructive">
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full bg-[var(--gradient-mint)] text-[var(--deep)] hover:opacity-90">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <button className="md:hidden ml-1" onClick={() => setMenu((v) => !v)}>
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="px-3 py-2 rounded-lg hover:bg-primary/10">{n.label}</Link>
            ))}
            <form onSubmit={onSearch} className="mt-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
                className="w-full rounded-full glass px-4 py-2 text-sm bg-transparent" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
