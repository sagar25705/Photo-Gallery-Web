import { Link } from "@tanstack/react-router";
import { Camera, Mail, Github, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[oklch(0.85_0.15_150/0.1)] glass-strong">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-[var(--gradient-mint)] grid place-items-center"><Camera className="size-5 text-[var(--deep)]" /></div>
            <span className="text-xl font-bold text-gradient-mint">PicZio</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Discover and share the world's most beautiful nature photography. From stunning landscapes to intimate wildlife portraits, find inspiration for your next adventure.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Developed by <span className="text-primary">Gauri Sagar</span> · <a href="mailto:gaurisagar343@gmail.com" className="hover:text-primary">gaurisagar343@gmail.com</a>
          </p>
        </div>
        <FooterCol title="Explore" links={[["Discover", "/explore"], ["Categories", "/categories"], ["Collections", "/collections"], ["Latest", "/explore"]]} />
        <FooterCol title="Community" links={[["Photographers", "/photographers"], ["Upload", "/upload"], ["Saved", "/saved"]]} />
        <FooterCol title="Company" links={[["About Us", "/about"], ["Contact", "/contact"]]} />
      </div>
      <div className="border-t border-[oklch(0.85_0.15_150/0.08)] py-5 px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} PicZio. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="mailto:gaurisagar343@gmail.com" aria-label="Email"><Mail className="size-4 hover:text-primary" /></a>
          <a href="#" aria-label="Instagram"><Instagram className="size-4 hover:text-primary" /></a>
          <a href="#" aria-label="GitHub"><Github className="size-4 hover:text-primary" /></a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 text-foreground">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={label}><Link to={href} className="hover:text-primary transition-colors">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
