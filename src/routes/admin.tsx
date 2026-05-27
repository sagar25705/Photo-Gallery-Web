import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Users, Image as ImageIcon, Download, Shield } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/" });
  }, [user, isAdmin, loading, nav]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"], enabled: !!isAdmin,
    queryFn: async () => {
      const [{ count: users }, { count: photos }, { data: dl }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("photos").select("*", { count: "exact", head: true }),
        supabase.from("photos").select("downloads_count"),
      ]);
      const downloads = (dl ?? []).reduce((s, r) => s + (r.downloads_count ?? 0), 0);
      return { users: users ?? 0, photos: photos ?? 0, downloads };
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["admin-photos"], enabled: !!isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("photos").select("id,title,image_url,user_id,created_at,profiles(username,name)").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"], enabled: !!isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const delPhoto = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-photos"] }); }
  };

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center gap-3">
          <Shield className="text-primary" />
          <h1 className="text-3xl font-bold">Admin <span className="text-gradient-mint">Dashboard</span></h1>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <Stat icon={<Users />} label="Total users" value={stats?.users ?? 0} />
          <Stat icon={<ImageIcon />} label="Total photos" value={stats?.photos ?? 0} />
          <Stat icon={<Download />} label="Total downloads" value={stats?.downloads ?? 0} />
        </div>

        <h2 className="mt-10 mb-4 text-xl font-bold">Recent uploads</h2>
        <div className="glass-strong rounded-3xl p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th className="p-2">Photo</th><th>Title</th><th>By</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {photos.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="p-2"><img src={p.image_url} alt="" className="size-12 rounded-lg object-cover" /></td>
                  <td>{p.title}</td>
                  <td className="text-muted-foreground">{(p.profiles as { username: string | null })?.username ?? "—"}</td>
                  <td className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td><Button size="icon" variant="ghost" onClick={() => delPhoto(p.id)}><Trash2 className="size-4 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 mb-4 text-xl font-bold">Users</h2>
        <div className="glass-strong rounded-3xl p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th className="p-2">Name</th><th>Username</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="p-2">{u.name}</td>
                  <td className="text-primary">@{u.username}</td>
                  <td className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">
      <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gradient-mint">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
