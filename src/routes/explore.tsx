import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PhotoCard, type Photo } from "@/components/PhotoCard";
import { supabase } from "@/integrations/supabase/client";

type SearchParams = { category?: string; q?: string; sort?: "latest" | "trending" | "liked" | "downloaded" };

export const Route = createFileRoute("/explore")({
  component: Explore,
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: s.category as string | undefined,
    q: s.q as string | undefined,
    sort: (s.sort as SearchParams["sort"]) ?? "latest",
  }),
});

const CATEGORIES = ["All", "Nature", "Wildlife", "Landscape", "Macro", "Portrait", "Travel", "Mountains", "Forest"];
const SORTS: { v: NonNullable<SearchParams["sort"]>; l: string }[] = [
  { v: "latest", l: "Latest" }, { v: "trending", l: "Trending" },
  { v: "liked", l: "Most Liked" }, { v: "downloaded", l: "Most Downloaded" },
];

function Explore() {
  const { category, q, sort } = Route.useSearch();
  const nav = Route.useNavigate();
  const [search, setSearch] = useState(q ?? "");

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["explore", category, q, sort],
    queryFn: async () => {
      let qb = supabase.from("photos").select("*, profiles!photos_profile_fk(username,name,avatar_url)").limit(60);
      if (category && category !== "All") qb = qb.eq("category", category);
      if (q) qb = qb.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
      if (sort === "liked" || sort === "trending") qb = qb.order("likes_count", { ascending: false });
      else if (sort === "downloaded") qb = qb.order("downloads_count", { ascending: false });
      else qb = qb.order("created_at", { ascending: false });
      const { data } = await qb;
      return (data ?? []) as unknown as Photo[];
    },
  });

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Explore the <span className="text-gradient-mint">Gallery</span></h1>
        <p className="text-muted-foreground mt-2">A curated stream of nature photography from the community.</p>

        <form onSubmit={(e) => { e.preventDefault(); nav({ search: (p) => ({ ...p, q: search }) }); }}
          className="mt-6 glass rounded-full flex p-1.5 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search photos, wildlife, landscapes…"
              className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none" />
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const active = (category ?? "All") === c;
            return (
              <button key={c} onClick={() => nav({ search: (p) => ({ ...p, category: c === "All" ? undefined : c }) })}
                className={`rounded-full px-4 py-1.5 text-sm transition-all ${active ? "bg-[var(--gradient-mint)] text-[var(--deep)] font-semibold glow-mint" : "glass hover:bg-primary/10"}`}>
                {c}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Sort by</span>
            <select value={sort} onChange={(e) => nav({ search: (p) => ({ ...p, sort: e.target.value as SearchParams["sort"] }) })}
              className="glass rounded-full bg-transparent px-3 py-1.5 outline-none">
              {SORTS.map((s) => <option key={s.v} value={s.v} className="bg-[var(--deep)]">{s.l}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-4 glass rounded-2xl animate-pulse" style={{ height: 200 + Math.random() * 200 }} />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No photos found. Try a different filter.</div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {photos.map((p, i) => <PhotoCard key={p.id} photo={p} idx={i} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
