import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Camera, Heart, Mountain } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <Layout withParticles>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold">About <span className="text-gradient-mint">PicZio</span></h1>
        <p className="text-lg text-muted-foreground mt-4">
          PicZio is a premium platform for nature photographers — a quiet, cinematic gallery where the wilderness gets the stage it deserves. Built and curated by <span className="text-primary">Gauri Sagar</span>, it's both a personal portfolio and a community for anyone who finds poetry in mist, mountains, moss, and movement.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: <Camera />, t: "Captured with care", d: "Every photo carries a story of patience, light, and place." },
            { icon: <Mountain />, t: "From 50+ locations", d: "Forests, summits, coastlines and quiet corners of the world." },
            { icon: <Heart />, t: "A growing community", d: "Photographers and admirers sharing the same green obsession." },
          ].map((b) => (
            <div key={b.t} className="glass-strong rounded-3xl p-6">
              <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center mb-3">{b.icon}</div>
              <h3 className="font-semibold">{b.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
