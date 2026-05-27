import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PhotoCard, type Photo } from "@/components/PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/saved")({ component: Saved });

function Saved() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  const { data = [] } = useQuery({
    queryKey: ["saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("saved_photos")
        .select("photos(*, profiles(username,name,avatar_url))")
        .eq("user_id", user!.id);
      return (data ?? []).map((r) => r.photos).filter(Boolean) as unknown as Photo[];
    },
  });

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold"><span className="text-gradient-mint">Saved</span> photos</h1>
        <div className="mt-8">
          {data.length === 0 ? <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No saved photos yet.</div> :
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {data.map((p, i) => <PhotoCard key={p.id} photo={p} idx={i} />)}
            </div>}
        </div>
      </div>
    </Layout>
  );
}
