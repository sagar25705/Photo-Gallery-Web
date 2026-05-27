import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Download, Bookmark, Share2, MapPin, Camera as CamIcon, Calendar, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/photo/$id")({ component: PhotoDetail });

function PhotoDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: photo, isLoading } = useQuery({
    queryKey: ["photo", id],
    queryFn: async () => {
      const { data } = await supabase.from("photos").select("*, profiles(username,name,avatar_url,bio)").eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*, profiles(username,name,avatar_url)").eq("photo_id", id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("likes").select("id").eq("user_id", user.id).eq("photo_id", id).maybeSingle().then(({ data }) => setLiked(!!data));
    supabase.from("saved_photos").select("id").eq("user_id", user.id).eq("photo_id", id).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, id]);

  if (isLoading) return <Layout><div className="p-10 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!photo) return <Layout><div className="p-10 text-center">Photo not found.</div></Layout>;

  const toggleLike = async () => {
    if (!user) { toast.error("Please log in to like"); return; }
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("photo_id", id);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, photo_id: id });
      setLiked(true);
    }
    qc.invalidateQueries({ queryKey: ["photo", id] });
  };

  const toggleSave = async () => {
    if (!user) { toast.error("Please log in to save"); return; }
    if (saved) {
      await supabase.from("saved_photos").delete().eq("user_id", user.id).eq("photo_id", id);
      setSaved(false); toast.success("Removed from saved");
    } else {
      await supabase.from("saved_photos").insert({ user_id: user.id, photo_id: id });
      setSaved(true); toast.success("Saved!");
    }
  };

  const download = async () => {
    try {
      const res = await fetch(photo.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${photo.title}.jpg`; a.click();
      URL.revokeObjectURL(url);
      await supabase.from("photos").update({ downloads_count: (photo.downloads_count ?? 0) + 1 }).eq("id", id);
      qc.invalidateQueries({ queryKey: ["photo", id] });
      toast.success("Downloading…");
    } catch { toast.error("Download failed"); }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: photo.title, url }); } catch {} }
    else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in"); return; }
    if (!comment.trim()) return;
    const { error } = await supabase.from("comments").insert({ user_id: user.id, photo_id: id, comment: comment.trim() });
    if (error) toast.error(error.message);
    else { setComment(""); qc.invalidateQueries({ queryKey: ["comments", id] }); }
  };

  const author = photo.profiles as { username: string | null; name: string | null; avatar_url: string | null; bio: string | null } | null;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
          <div className="glass-strong rounded-3xl p-3 overflow-hidden">
            <img src={photo.image_url} alt={photo.title} className="w-full h-auto rounded-2xl object-contain max-h-[80vh]" />
          </div>

          <div className="space-y-5">
            <div className="glass-strong rounded-3xl p-6">
              <h1 className="text-2xl font-bold">{photo.title}</h1>
              {photo.description && <p className="text-sm text-muted-foreground mt-2">{photo.description}</p>}

              {author && (
                <Link to="/profile/$username" params={{ username: author.username ?? "" }} className="mt-5 flex items-center gap-3 group">
                  <div className="size-11 rounded-full overflow-hidden bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] font-bold">
                    {author.avatar_url ? <img src={author.avatar_url} alt="" className="size-full object-cover" /> : (author.name?.[0] ?? "?")}
                  </div>
                  <div>
                    <div className="font-medium group-hover:text-primary">{author.name ?? "Photographer"}</div>
                    <div className="text-xs text-muted-foreground">@{author.username}</div>
                  </div>
                </Link>
              )}

              <div className="grid grid-cols-4 gap-2 mt-5">
                <ActionBtn icon={<Heart className={liked ? "fill-primary text-primary" : ""} />} label={String(photo.likes_count)} onClick={toggleLike} />
                <ActionBtn icon={<Download />} label={String(photo.downloads_count)} onClick={download} />
                <ActionBtn icon={<Bookmark className={saved ? "fill-primary text-primary" : ""} />} label="Save" onClick={toggleSave} />
                <ActionBtn icon={<Share2 />} label="Share" onClick={share} />
              </div>

              <div className="mt-6 space-y-2 text-sm">
                {photo.location && <Meta icon={<MapPin className="size-4" />} text={photo.location} />}
                {photo.camera && <Meta icon={<CamIcon className="size-4" />} text={[photo.camera, photo.lens].filter(Boolean).join(" · ")} />}
                {photo.capture_date && <Meta icon={<Calendar className="size-4" />} text={new Date(photo.capture_date).toLocaleDateString()} />}
              </div>

              {(photo.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(photo.tags ?? []).map((t: string) => (
                    <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <h3 className="font-semibold mb-3">Comments · {comments.length}</h3>
              <form onSubmit={addComment} className="flex gap-2 mb-4">
                <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment…"
                  className="flex-1 glass rounded-xl bg-transparent px-3 py-2 text-sm outline-none" />
                <Button type="submit" size="icon" className="rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)]"><Send className="size-4" /></Button>
              </form>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments.map((c: { id: string; comment: string; created_at: string; profiles: { name: string | null; username: string | null; avatar_url: string | null } | null }) => (
                  <div key={c.id} className="flex gap-3 text-sm">
                    <div className="size-8 rounded-full bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] text-xs font-bold shrink-0">
                      {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} alt="" className="size-full rounded-full object-cover" /> : (c.profiles?.name?.[0] ?? "?")}
                    </div>
                    <div>
                      <div className="font-medium text-xs">{c.profiles?.name ?? "User"} <span className="text-muted-foreground">· {new Date(c.created_at).toLocaleDateString()}</span></div>
                      <p className="text-muted-foreground mt-0.5">{c.comment}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-xs text-muted-foreground">Be the first to comment.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass rounded-xl py-3 flex flex-col items-center gap-1 hover:bg-primary/10 transition-colors text-xs">
      {icon}<span>{label}</span>
    </button>
  );
}
function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 text-muted-foreground">{icon}<span>{text}</span></div>;
}
