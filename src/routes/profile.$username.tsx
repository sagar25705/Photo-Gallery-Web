// import { createFileRoute, Link } from "@tanstack/react-router";
// import { useQuery } from "@tanstack/react-query";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { Edit2 } from "lucide-react";
// import { Layout } from "@/components/Layout";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/lib/auth-context";
// import { PhotoCard, type Photo } from "@/components/PhotoCard";
// import { Button } from "@/components/ui/button";

// export const Route = createFileRoute("/profile/$username")({ component: ProfilePage });

// function ProfilePage() {
//   const { username } = Route.useParams();
//   const { user, profile, refreshProfile } = useAuth();
//   const [editing, setEditing] = useState(false);
//   const [name, setName] = useState("");
//   const [bio, setBio] = useState("");
//   const [website, setWebsite] = useState("");
//   const [avatar, setAvatar] = useState("");

//   const { data: target, refetch } = useQuery({
//     queryKey: ["profile", username],
//     queryFn: async () => {
//       let target = username;
//       if (username === "me" && profile?.username) target = profile.username;
//       const { data } = await supabase.from("profiles").select("*").eq("username", target).maybeSingle();
//       return data;
//     },
//   });

//   const { data: photos = [] } = useQuery({
//     queryKey: ["profile-photos", target?.id],
//     enabled: !!target?.id,
//     queryFn: async () => {
//       const { data } = await supabase.from("photos").select("*").eq("user_id", target!.id).order("created_at", { ascending: false });
//       return (data ?? []) as unknown as Photo[];
//     },
//   });

//   useEffect(() => {
//     if (target) { setName(target.name ?? ""); setBio(target.bio ?? ""); setWebsite(target.website ?? ""); setAvatar(target.avatar_url ?? ""); }
//   }, [target]);

//   const isOwn = user && target && user.id === target.id;

//   const save = async () => {
//     if (!user) return;
//     const { error } = await supabase.from("profiles").update({ name, bio, website, avatar_url: avatar }).eq("id", user.id);
//     if (error) toast.error(error.message);
//     else { toast.success("Profile updated"); setEditing(false); refetch(); refreshProfile(); }
//   };

//   if (!target) return <Layout><div className="p-10 text-center text-muted-foreground">Profile not found.</div></Layout>;

//   return (
//     <Layout withParticles>
//       <div className="mx-auto max-w-6xl px-4 py-10">
//         <div className="glass-strong rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
//           <div className="size-28 rounded-full overflow-hidden bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] text-4xl font-bold glow-mint">
//             {target.avatar_url ? <img src={target.avatar_url} alt="" className="size-full object-cover" /> : (target.name?.[0] ?? "?")}
//           </div>
//           <div className="flex-1 text-center md:text-left">
//             <h1 className="text-3xl font-bold">{target.name}</h1>
//             <p className="text-primary">@{target.username}</p>
//             {target.bio && <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{target.bio}</p>}
//             {target.website && <a href={target.website} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">{target.website}</a>}
//             <div className="mt-4 flex gap-6 justify-center md:justify-start text-sm">
//               <div><span className="font-bold text-lg text-gradient-mint">{photos.length}</span> <span className="text-muted-foreground">photos</span></div>
//             </div>
//           </div>
//           {isOwn && (
//             <Button onClick={() => setEditing((v) => !v)} variant="outline" size="sm" className="rounded-full">
//               <Edit2 className="size-3.5 mr-1" /> {editing ? "Cancel" : "Edit profile"}
//             </Button>
//           )}
//         </div>

//         {editing && (
//           <div className="glass rounded-3xl p-6 mt-6 grid gap-3 max-w-2xl">
//             <Field label="Name" value={name} onChange={setName} />
//             <Field label="Bio" value={bio} onChange={setBio} textarea />
//             <Field label="Website" value={website} onChange={setWebsite} />
//             <Field label="Avatar URL" value={avatar} onChange={setAvatar} />
//             <Button onClick={save} className="rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)]">Save</Button>
//           </div>
//         )}

//         <h2 className="text-xl font-bold mt-10 mb-4">Photos</h2>
//         {photos.length === 0 ? (
//           <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
//             No photos yet. {isOwn && <Link to="/upload" className="text-primary hover:underline">Upload your first photo →</Link>}
//           </div>
//         ) : (
//           <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
//             {photos.map((p, i) => <PhotoCard key={p.id} photo={p} idx={i} />)}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
//   return (
//     <label className="block">
//       <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
//       {textarea
//         ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none" />
//         : <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none" />}
//     </label>
//   );
// }








import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PhotoCard, type Photo } from "@/components/PhotoCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
});

type ProfileType = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
};

function ProfilePage() {
  const { username } = Route.useParams();
  const { user, profile, refreshProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState("");

  const { data: target, refetch } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      let targetUsername = username;

      if (username === "me" && profile?.username) {
        targetUsername = profile.username;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          username,
          bio,
          avatar_url,
          website
        `)
        .eq("username", targetUsername)
        .maybeSingle();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error);
        return null;
      }

      return data as ProfileType | null;
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["profile-photos", target?.id],
    enabled: !!target?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select(`
          id,
          title,
          image_url,
          description,
          category,
          tags,
          location,
          camera,
          lens,
          capture_date,
          likes_count,
          downloads_count,
          created_at,
          user_id
        `)
        .eq("user_id", target!.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("PROFILE PHOTOS ERROR:", error);
        return [];
      }

      return (data ?? []) as Photo[];
    },
  });

  useEffect(() => {
    if (target) {
      setName(target.name ?? "");
      setBio(target.bio ?? "");
      setWebsite(target.website ?? "");
      setAvatar(target.avatar_url ?? "");
    }
  }, [target]);

  const isOwn = !!(user && target && user.id === target.id);

  const save = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        website,
        avatar_url: avatar,
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
      setEditing(false);
      refetch();
      refreshProfile();
    }
  };

  if (!target) {
    return (
      <Layout>
        <div className="p-10 text-center text-muted-foreground">
          Profile not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* PROFILE HEADER */}
        <div className="glass-strong rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">

          {/* AVATAR */}
          <div className="size-28 rounded-full overflow-hidden bg-[var(--gradient-mint)] grid place-items-center text-[var(--deep)] text-4xl font-bold glow-mint">
            {target.avatar_url ? (
              <img
                src={target.avatar_url}
                alt={target.name ?? "Profile"}
                className="size-full object-cover"
              />
            ) : (
              target.name?.[0]?.toUpperCase() ?? "?"
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">
              {target.name ?? "Unnamed User"}
            </h1>

            <p className="text-primary">
              @{target.username}
            </p>

            {target.bio && (
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                {target.bio}
              </p>
            )}

            {target.website && (
              <a
                href={target.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                {target.website}
              </a>
            )}

            <div className="mt-4 flex gap-6 justify-center md:justify-start text-sm">
              <div>
                <span className="font-bold text-lg text-gradient-mint">
                  {photos.length}
                </span>{" "}
                <span className="text-muted-foreground">
                  photos
                </span>
              </div>
            </div>
          </div>

          {/* EDIT BUTTON */}
          {isOwn && (
            <Button
              onClick={() => setEditing((v) => !v)}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Edit2 className="size-3.5 mr-1" />
              {editing ? "Cancel" : "Edit profile"}
            </Button>
          )}
        </div>

        {/* EDIT FORM */}
        {editing && (
          <div className="glass rounded-3xl p-6 mt-6 grid gap-3 max-w-2xl">
            <Field
              label="Name"
              value={name}
              onChange={setName}
            />

            <Field
              label="Bio"
              value={bio}
              onChange={setBio}
              textarea
            />

            <Field
              label="Website"
              value={website}
              onChange={setWebsite}
            />

            <Field
              label="Avatar URL"
              value={avatar}
              onChange={setAvatar}
            />

            <Button
              onClick={save}
              className="rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)]"
            >
              Save
            </Button>
          </div>
        )}

        {/* PHOTOS */}
        <h2 className="text-xl font-bold mt-10 mb-4">
          Photos
        </h2>

        {photos.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
            No photos yet.{" "}
            {isOwn && (
              <Link
                to="/upload"
                className="text-primary hover:underline"
              >
                Upload your first photo →
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {photos.map((p, i) => (
              <PhotoCard
                key={p.id}
                photo={p}
                idx={i}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none"
        />
      )}
    </label>
  );
}