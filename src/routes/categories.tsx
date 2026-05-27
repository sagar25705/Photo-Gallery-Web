import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/categories")({ component: Categories });

const CATS = [
  { name: "Nature", emoji: "🌿" }, { name: "Wildlife", emoji: "🦌" },
  { name: "Landscape", emoji: "🏞️" }, { name: "Macro", emoji: "🐝" },
  { name: "Portrait", emoji: "📷" }, { name: "Travel", emoji: "🧭" },
  { name: "Mountains", emoji: "⛰️" }, { name: "Forest", emoji: "🌲" },
];

function Categories() {
  const { data: counts = {} } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const out: Record<string, number> = {};
      await Promise.all(CATS.map(async (c) => {
        const { count } = await supabase.from("photos").select("*", { count: "exact", head: true }).eq("category", c.name);
        out[c.name] = count ?? 0;
      }));
      return out;
    },
  });

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Browse <span className="text-gradient-mint">categories</span></h1>
        <p className="text-muted-foreground mt-2">Pick a theme and dive in.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATS.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to="/explore" search={{ category: c.name }}
                className="glass-strong rounded-3xl p-6 block hover:bg-primary/10 transition-all hover:-translate-y-1">
                <div className="text-4xl">{c.emoji}</div>
                <div className="font-semibold mt-3">{c.name}</div>
                <div className="text-xs text-muted-foreground">{counts[c.name] ?? 0} photos</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
