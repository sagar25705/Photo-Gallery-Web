import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload as UploadIcon, X, Image as ImageIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/upload")({ component: UploadPage });

const CATS = ["Nature", "Wildlife", "Landscape", "Macro", "Portrait", "Travel", "Mountains", "Forest"];

function UploadPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nature");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Only JPG, PNG, WEBP allowed"); return;
    }
    if (f.size > 15 * 1024 * 1024) { toast.error("Max 15MB"); return; }
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    if (!title.trim()) { toast.error("Title required"); return; }
    setBusy(true); setProgress(20);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      setProgress(70);
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(path);
      const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data, error: insErr } = await supabase.from("photos").insert({
        user_id: user.id,
        image_url: publicUrl,
        storage_path: path,
        title: title.trim(),
        description: description.trim() || null,
        category, tags: tagArr,
        location: location.trim() || null,
        camera: camera.trim() || null,
        lens: lens.trim() || null,
        capture_date: captureDate || null,
      }).select("id").single();
      if (insErr) throw insErr;
      setProgress(100);
      toast.success("Photo uploaded!");
      nav({ to: "/photo/$id", params: { id: data.id } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold">
          Upload a <span className="text-gradient-mint">photo</span>
        </motion.h1>
        <p className="text-muted-foreground mt-2">Share your view of nature with the world.</p>

        <form onSubmit={submit} className="mt-8 grid md:grid-cols-2 gap-6">
          {/* DROPZONE */}
          <div className="glass-strong rounded-3xl p-6">
            {preview ? (
              <div className="relative">
                <img src={preview} alt="" className="w-full rounded-2xl object-cover max-h-[500px]" />
                <button type="button" onClick={() => { setFile(null); setPreview(""); }}
                  className="absolute top-2 right-2 size-9 rounded-full bg-black/70 grid place-items-center"><X className="size-4" /></button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 hover:bg-primary/5 transition-colors">
                  <ImageIcon className="size-12 mx-auto text-primary opacity-70" />
                  <p className="mt-4 font-medium">Drag & drop or click to choose</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP · max 15MB</p>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              </label>
            )}
            {busy && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[var(--gradient-mint)] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Uploading… {progress}%</p>
              </div>
            )}
          </div>

          {/* METADATA */}
          <div className="space-y-4">
            <Field label="Title*" value={title} onChange={setTitle} />
            <Field label="Description" value={description} onChange={setDescription} textarea />
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none">
                {CATS.map((c) => <option key={c} value={c} className="bg-[var(--deep)]">{c}</option>)}
              </select>
            </label>
            <Field label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="forest, sunset, mist" />
            <Field label="Location" value={location} onChange={setLocation} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Camera" value={camera} onChange={setCamera} />
              <Field label="Lens" value={lens} onChange={setLens} />
            </div>
            <Field label="Capture date" type="date" value={captureDate} onChange={setCaptureDate} />
            <Button type="submit" disabled={busy || !file}
              className="w-full rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] font-semibold h-11">
              <UploadIcon className="size-4 mr-2" />{busy ? "Uploading…" : "Publish photo"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

function Field({ label, value, onChange, type = "text", textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
      )}
    </label>
  );
}
