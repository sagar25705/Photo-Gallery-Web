// import { createFileRoute, Link } from "@tanstack/react-router";
// import { useQuery } from "@tanstack/react-query";
// import { Layout } from "@/components/Layout";
// import { supabase } from "@/integrations/supabase/client";

// export const Route = createFileRoute("/photographers")({ component: Photographers });

// function Photographers() {
//   const { data: list = [] } = useQuery({
//     queryKey: ["photographers"],
//     queryFn: async () => {
//       const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(40);
//       return data ?? [];
//     },
//   });

//   return (
//     <Layout withParticles>
//       <div className="mx-auto max-w-7xl px-4 py-10">
//         <h1 className="text-3xl md:text-4xl font-bold"><span className="text-gradient-mint">Photographers</span></h1>
//         <p className="text-muted-foreground mt-2">Meet the eyes behind the lens.</p>
//         <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {list.map((p) => (
//             <Link key={p.id} to="/profile/$username" params={{ username: p.username ?? "" }}
//               className="glass-strong rounded-3xl p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-all">
//               <div className="size-20 rounded-full overflow-hidden bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] text-2xl font-bold">
//                 {p.avatar_url ? <img src={p.avatar_url} alt="" className="size-full object-cover" /> : (p.name?.[0] ?? "?")}
//               </div>
//               <div className="font-semibold mt-3">{p.name}</div>
//               <div className="text-xs text-primary">@{p.username}</div>
//               {p.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>}
//             </Link>
//           ))}
//           {list.length === 0 && <div className="col-span-full glass rounded-2xl p-10 text-center text-muted-foreground">No photographers yet.</div>}
//         </div>
//       </div>
//     </Layout>
//   );
// }






import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/photographers")({
  component: Photographers,
});

type ProfileType = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at?: string | null;
};

function Photographers() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["photographers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          username,
          bio,
          avatar_url,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(40);

      if (error) {
        console.error("PHOTOGRAPHERS FETCH ERROR:", error);
        return [];
      }

      return (data ?? []) as ProfileType[];
    },
  });

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-gradient-mint">
              Photographers
            </span>
          </h1>

          <p className="text-muted-foreground mt-2">
            Meet the eyes behind the lens.
          </p>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="mt-8 glass rounded-2xl p-10 text-center text-muted-foreground">
            Loading photographers...
          </div>
        )}

        {/* GRID */}
        {!isLoading && (
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {list.map((p) => (
              <Link
                key={p.id}
                to="/profile/$username"
                params={{
                  username: p.username ?? "",
                }}
                className="glass-strong rounded-3xl p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300"
              >
                {/* AVATAR */}
                <div className="size-20 rounded-full overflow-hidden bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] text-2xl font-bold">

                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.name ?? "Profile"}
                      className="size-full object-cover"
                    />
                  ) : (
                    p.name?.[0]?.toUpperCase() ?? "?"
                  )}
                </div>



                {/* NAME */}
                <div className="font-semibold mt-3 line-clamp-1">
                  {p.name ?? "Unnamed User"}
                </div>

                {/* USERNAME */}
                <div className="text-xs text-primary">
                  @{p.username ?? "unknown"}
                </div>

                {/* BIO */}
                {p.bio && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {p.bio}
                  </p>
                )}
              </Link>
            ))}

            {/* EMPTY STATE */}
            {list.length === 0 && (
              <div className="col-span-full glass rounded-2xl p-10 text-center text-muted-foreground">
                No photographers yet.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
 }