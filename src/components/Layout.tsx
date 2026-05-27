import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Particles } from "./Particles";

export function Layout({ children, withParticles = false }: { children: ReactNode; withParticles?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      {withParticles && <Particles />}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
