import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/collections")({ component: Collections });

const COLLECTIONS = [
  { tag: "Mountains", title: "Mountain Majesty" },
  { tag: "Forest", title: "Into the Woods" },
  { tag: "Wildlife", title: "Wild Encounters" },
  { tag: "Macro", title: "Tiny Worlds" },
  { tag: "Landscape", title: "Open Horizons" },
  { tag: "Portrait", title: "Faces of Nature" },
];

function Collections() {
  const { data: photos = [] } = useQuery({
    queryKey: ["collections-preview"],
    queryFn: async () => {
      const { data } = await supabase.from("photos").select("id,image_url,category").limit(60);
      return data ?? [];
    },
  });

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Curated <span className="text-gradient-mint">Collections</span></h1>
        <p className="text-muted-foreground mt-2">Hand-picked stories from the wild.</p>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COLLECTIONS.map((c) => {
            const preview = photos.filter((p) => p.category === c.tag).slice(0, 4);
            return (
              <Link key={c.tag} to="/explore" search={{ category: c.tag }}
                className="glass-strong rounded-3xl overflow-hidden hover:-translate-y-1 transition-all block">
                <div className="grid grid-cols-2 gap-0.5 h-48 bg-black/30">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-muted overflow-hidden">
                      {preview[i] ? <img src={preview[i].image_url} alt="" className="size-full object-cover" /> : <div className="size-full grid place-items-center text-muted-foreground text-xs">—</div>}
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.tag} collection</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
