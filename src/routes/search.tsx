import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PhotoCard, type Photo } from "@/components/PhotoCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data = [], isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q) return [];
      const { data } = await supabase.from("photos")
        .select("*, profiles(username,name,avatar_url)")
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,location.ilike.%${q}%`)
        .limit(60);
      return (data ?? []) as unknown as Photo[];
    },
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">Search results for "<span className="text-gradient-mint">{q}</span>"</h1>
        <p className="text-muted-foreground mt-1 text-sm">{data.length} photos found</p>
        <div className="mt-6">
          {isLoading ? <p className="text-muted-foreground">Searching…</p> :
           data.length === 0 ? <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No matches.</div> :
           <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
             {data.map((p, i) => <PhotoCard key={p.id} photo={p} idx={i} />)}
           </div>}
        </div>
      </div>
    </Layout>
  );
}
