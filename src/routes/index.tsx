import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ImageIcon, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PhotoCard, type Photo } from "@/components/PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const CATEGORIES = ["Nature", "Wildlife", "Landscape", "Macro", "Portrait", "Travel", "Mountains", "Forest"];

function Home() {
  const [q, setQ] = useState("");

  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photos")
        .select("*, profiles(username,name,avatar_url)")
        .order("likes_count", { ascending: false })
        .limit(8);
      return (data ?? []) as unknown as Photo[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [{ count: photos }, { count: users }] = await Promise.all([
        supabase.from("photos").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return { photos: photos ?? 0, users: users ?? 0 };
    },
  });

  return (
    <Layout withParticles>
      {/* HERO */}
      <section className="relative pt-16 pb-24 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-primary mb-6"
          >
            <Sparkles className="size-3.5" /> Nature photography by Gauri Sagar
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            Welcome to <span className="text-gradient-mint">PicZio's</span><br />Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Explore a curated collection of nature photography, capturing the beauty of wildlife, landscapes, and macro details from around the world.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            onSubmit={(e) => { e.preventDefault(); if (q.trim()) location.href = `/search?q=${encodeURIComponent(q)}`; }}
            className="mt-10 mx-auto max-w-xl flex glass rounded-full p-1.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my photos, landscapes…"
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none" />
            </div>
            <Button type="submit" className="rounded-full bg-[var(--gradient-mint)] text-[var(--deep)] px-6 font-semibold">Search</Button>
          </motion.form>

          {/* STATS */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <StatCard icon={<ImageIcon />} value={`${(stats?.photos ?? 0) + 500}+`} label="Photos Captured" />
            <StatCard icon={<MapPin />} value="50+" label="Locations Visited" />
            <StatCard icon={<Users />} value={`${(stats?.users ?? 0) + 1000}+`} label="Happy Viewers" />
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-10"
          >
            <Button asChild className="rounded-full bg-[var(--gradient-mint)] text-[var(--deep)] px-8 py-6 text-base font-semibold animate-pulse-glow">
              <Link to="/explore">Explore Gallery <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section className="px-4 mb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse by category</h2>
            <Link to="/categories" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <Link key={c} to="/explore" search={{ category: c }}
                className="shrink-0 glass rounded-full px-5 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending photos</h2>
            <Link to="/explore" className="text-sm text-primary hover:underline">See more →</Link>
          </div>
          {trending.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {trending.map((p, i) => <PhotoCard key={p.id} photo={p} idx={i} />)}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-5 flex flex-col items-center">
      <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center mb-3 glow-mint">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gradient-mint">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl p-12 text-center">
      <ImageIcon className="size-12 mx-auto text-primary opacity-60" />
      <p className="mt-4 text-muted-foreground">No photos yet — be the first to upload!</p>
      <Button asChild className="mt-4 rounded-full bg-[var(--gradient-mint)] text-[var(--deep)]">
        <Link to="/upload">Upload Your First Photo</Link>
      </Button>
    </div>
  );
}
