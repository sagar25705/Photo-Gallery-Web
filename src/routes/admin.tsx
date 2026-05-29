
import { Search } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect , useState} from "react";
import { toast } from "sonner";
import {
  Trash2,
  Users,
  UserPlus,
  Image as ImageIcon,
  Download,
  Shield,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  ExternalLink,
} from "lucide-react";

import { Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading } = useAuth();

  const nav = useNavigate();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const lastAdminLogin = new Date().toLocaleString();

  const deleteComment = async (commentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(error);
      alert("Failed to delete comment");
    } else {
      qc.invalidateQueries({
        queryKey: ["admin-comments"],
      });
    }
  };

  // 👇 NEW FUNCTION ADD KARO
 const toggleBan = async (
  userId: string,
  currentStatus: boolean
) => {

  console.log("BAN CLICKED");

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: !currentStatus,
    } as any)
    .eq("id", userId);

  console.log("PROFILE UPDATE ERROR:", error);

  const { data, error: logError } =
    await (supabase as any)
      .from("admin_logs")
      .insert({
        action: currentStatus
          ? "User Unbanned"
          : "User Banned",

        target_type: "user",
        target_id: userId,
        admin_id: user?.id,
      })
      .select();
  console.log("LOG DATA:", data);
  console.log("LOG ERROR:", logError);

const { data: notifData, error: notifError } =
  await (supabase as any)
    .from("admin_notifications")
    .insert({
      title: currentStatus
        ? "User Unbanned"
        : "User Banned",

      description: currentStatus
        ? "A user has been unbanned"
        : "A user has been banned",

      is_read: false,
    })
    .select();

console.log("NOTIF DATA:", notifData);
console.log("NOTIF ERROR:", notifError);

  if (error) {
    return;
  }

  qc.invalidateQueries({
    queryKey: ["admin-users"],
  });
};

const exportUsersCSV = () => {
  const csvRows = [
    [
      "Name",
      "Username",
      "Photos",
      "Status",
      "Joined",
    ],

    ...users.map((u: any) => [
      u.name ?? "",
      u.username ?? "",
      u.photos?.length ?? 0,
      u.is_banned ? "Banned" : "Active",
      new Date(
        u.created_at
      ).toLocaleDateString(),
    ]),
  ];

  const csvContent = csvRows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    "users.csv"
  );

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  toast.success(
    "Users CSV exported successfully"
  );
};

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      nav({ to: "/" });
    }
  }, [user, isAdmin, loading, nav]);

  // STATS
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!isAdmin,

    queryFn: async () => {
      const [
        { count: users },
        { count: photos },
        { count: likes },
        { count: comments },
        { count: saved },
        { data: dl },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("photos")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("likes")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("comments")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("saved_photos")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("photos")
          .select("downloads_count"),
      ]);

      const downloads = (dl ?? []).reduce(
        (s, r) => s + (r.downloads_count ?? 0),
        0
      );

      return {
        users: users ?? 0,
        photos: photos ?? 0,
        likes: likes ?? 0,
        comments: comments ?? 0,
        saved: saved ?? 0,
        downloads,
      };
    },
  });

  // RECENT PHOTOS
  const { data: photos = [] } = useQuery({
    queryKey: ["admin-photos"],
    enabled: !!isAdmin,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select(`
          id,
          title,
          image_url,
          user_id,
          created_at,
          profiles!photos_profile_fk(
            username,
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      if (error) {
        console.error(
          "ADMIN PHOTOS ERROR:",
          error
        );

        return [];
      }

      return data ?? [];
    },
  });

// USERS
const { data: users = [] } = useQuery({
  queryKey: ["admin-users"],
  enabled: !!isAdmin,

  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        username,
        created_at,
        is_banned,
        photos(id)
      `)      
      .order("created_at", {
        ascending: false,
      })
      .limit(50);

    if (error) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );
      return [];
    }

    return data ?? [];
  },
});

// USER STATS
const activeUsers = users.filter(
  (u: any) => !u.is_banned
).length;

const bannedUsers = users.filter(
  (u: any) => u.is_banned
).length;

const today = new Date().toDateString();

const todaysUsers = users.filter(
  (u: any) =>
    new Date(
      u.created_at
    ).toDateString() === today
).length;

const todaysUploads = photos.filter(
  (p: any) =>
    new Date(
      p.created_at
    ).toDateString() === today
).length;



// RECENT COMMENTS
const { data: comments = [] } = useQuery({
  queryKey: ["admin-comments"],
  enabled: !!isAdmin,

  queryFn: async () => {
    const { data, error } =
      await supabase
        .from("comments")
        .select(`
          id,
          photo_id,
          comment,
          created_at,
          photo_title,
          commented_by_name
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

    if (error) {
      console.error(
        "ADMIN COMMENTS ERROR:",
        error
      );

      return [];
    }

    return data ?? [];
  },
});

// COMMENT STATS
const todaysComments = comments.filter(
  (c: any) =>
    new Date(
      c.created_at
    ).toDateString() === today
).length;

const saveDailyStats = async () => {
  console.log("USERS:", users);
  console.log("PHOTOS:", photos);
  console.log("COMMENTS:", comments);

  console.log("USERS LENGTH:", users?.length);
  console.log("PHOTOS LENGTH:", photos?.length);
  console.log("COMMENTS LENGTH:", comments?.length);

  const { data, error } = await (supabase as any)
    .from("daily_stats")
    .upsert(
      {
        stat_date: new Date().toISOString().split("T")[0],

        total_users: users?.length || 0,
        total_photos: photos?.length || 0,
        total_comments: comments?.length || 0,
        total_downloads: 0,
      },
      {
        onConflict: "stat_date",
      }
    )
    .select();

  console.log("DAILY STATS DATA:", data);
  console.log("DAILY STATS ERROR:", error);
};

useEffect(() => {
  if (users && photos && comments) {
    saveDailyStats();
  }
}, [users, photos, comments]);
  
  // DELETE PHOTO
  const delPhoto = async (id: string) => {
    if (!confirm("Delete this photo?")) {
      return;
    }

    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Deleted");

      qc.invalidateQueries({
        queryKey: ["admin-photos"],
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* HEADER */}
<div className="flex items-center gap-3">
  <Shield className="text-primary" />

  <h1 className="text-3xl font-bold">
    Admin{" "}
    <span className="text-gradient-mint">
      Dashboard
    </span>
  </h1>
</div>

<div className="glass-strong rounded-3xl p-6 mt-6 mb-6">
  <h2 className="text-2xl font-bold">
    Welcome Admin 👋
  </h2>

  <p className="text-muted-foreground mt-2">
    Manage users, photos, comments and platform activity.
  </p>

  <p className="text-sm text-primary mt-3">
    Last Admin Login: {lastAdminLogin}
  </p>
</div>

{/* STATS */}
<div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

  <Stat
    icon={<Users />}
    label="Total users"
    value={stats?.users ?? 0}
  />

  <Stat
    icon={<ImageIcon />}
    label="Total photos"
    value={stats?.photos ?? 0}
  />

  <Stat
    icon={<Download />}
    label="Total downloads"
    value={stats?.downloads ?? 0}
  />

  <Stat
    icon={<Heart />}
    label="Total likes"
    value={stats?.likes ?? 0}
  />

  <Stat
    icon={<MessageCircle />}
    label="Total comments"
    value={stats?.comments ?? 0}
  />

  <Stat
    icon={<Bookmark />}
    label="Saved photos"
    value={stats?.saved ?? 0}
  />
</div>

<div className="grid md:grid-cols-5 gap-4 mt-6 mb-10">

 <div className="glass-strong rounded-3xl p-5">
  <p className="text-sm text-muted-foreground">
    Active Users
  </p>

  <p className="text-4xl font-bold text-green-500 mt-2">
    {activeUsers}
  </p>
</div>

  <div className="glass-strong rounded-3xl p-5">
  <p className="text-sm text-muted-foreground">
    Banned Users
  </p>

  <p className="text-4xl font-bold text-red-500 mt-2">
    {bannedUsers}
  </p>
</div>

  <div className="glass-strong rounded-3xl p-5">
  <p className="text-sm text-muted-foreground">
    Today's Uploads
  </p>

  <p className="text-4xl font-bold mt-2">
    {todaysUploads}
  </p>
</div>

  <div className="glass-strong rounded-3xl p-5">
  <p className="text-sm text-muted-foreground">
    Today's Comments
  </p>

  <p className="text-4xl font-bold mt-2">
    {todaysComments}
  </p>
</div>

  <div className="glass-strong rounded-3xl p-5">
  <p className="text-sm text-muted-foreground">
    New Users Today
  </p>

  <p className="text-4xl font-bold mt-2">
    {todaysUsers}
  </p>
</div>

</div>

        {/* RECENT UPLOADS */}
        <h2 className="mt-10 mb-4 text-xl font-bold">
          Recent uploads
        </h2>

        <div className="glass-strong rounded-3xl p-4 overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">Photo</th>
                <th>Title</th>
                <th>By</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {photos.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-t border-white/5"
                >

                  <td className="p-2">
                    <img
                      src={p.image_url}
                      alt=""
                      className="size-12 rounded-lg object-cover"
                    />
                  </td>

                  <td>{p.title}</td>

                  <td className="text-muted-foreground">
                    {p.profiles?.username
                      ? `@${p.profiles.username}`
                      : p.user_id}
                  </td>

                  <td className="text-muted-foreground">
                    {new Date(
                      p.created_at
                    ).toLocaleDateString()}
                  </td>

               <td className="space-x-3">

                <Link
                  to="/photo/$id"
                  params={{ id: p.id }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Preview
                </Link>

                <button
                  onClick={() => delPhoto(p.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete               
                </button>

              </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

{/* USERS */}

<div className="mt-10 mb-4 flex items-center justify-between">

  <h2 className="text-xl font-bold">
    Users
  </h2>

  <button
    onClick={exportUsersCSV}
    className="
      rounded-xl
      bg-primary
      px-4
      py-2
      text-sm
      font-medium
      text-primary-foreground
      hover:opacity-90
    "
  >
    Export CSV
  </button>

</div>

<div className="mb-4">
  <input
    type="text"
    placeholder="Search user..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    className="
      w-full
      rounded-xl
      border
      border-white/10
      bg-transparent
      px-4
      py-2
    "
  />
</div>


<div className="glass-strong rounded-3xl p-4 overflow-x-auto">

  <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
               <th>NAME</th>
               <th>USERNAME</th>
               <th>PHOTOS</th>
               <th>STATUS</th>
               <th>JOINED</th>
               <th>ACTION</th>
              </tr>
            </thead>

<tbody>
  {users
    .filter(
      (u: any) =>
        u.name?.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        u.username?.toLowerCase().includes(
          searchTerm.toLowerCase()
        )
    )
    .map((u: any) => (
      <tr
        key={u.id}
        className="border-t border-white/5"
      >
        <td className="p-2">
          {u.name}
        </td>

        <td className="text-primary">
          @{u.username}
        </td>

        <td>
          <span className="font-semibold">
            {u.photos?.length ?? 0}
          </span>
        </td>

        <td>
          {u.is_banned ? (
            <span className="text-red-500 font-semibold">
              Banned
            </span>
          ) : (
            <span className="text-green-500 font-semibold">
              Active
            </span>
          )}
        </td>

        <td className="text-muted-foreground">
          {new Date(
            u.created_at
          ).toLocaleDateString()}
        </td>

        <td>
          <button
            onClick={() =>
              toggleBan(
                u.id,
                u.is_banned
              )
            }
            className={
              u.is_banned
                ? "text-green-500 hover:text-green-700"
                : "text-red-500 hover:text-red-700"
            }
          >
            {u.is_banned
              ? "Unban"
              : "Ban"}
          </button>
        </td>
      </tr>
    ))}
</tbody>
          </table>
        </div>

        {/* RECENT COMMENTS */}
        <h2 className="mt-10 mb-4 text-xl font-bold">
          Recent comments
        </h2>

        <div className="glass-strong rounded-3xl p-4 overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="p-2">User</th>
                <th>Photo</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

           <tbody>
             {comments.map((c: any) => (
               <tr
                 key={c.id}
                 className="border-t border-white/5"
               >
                 <td className="p-2">
                   {c.commented_by_name || "Unknown User"}
                 </td>

                 <td>
                   {c.photo_title}
                 </td>
           
                 <td className="text-muted-foreground">
                   {c.comment}
                 </td>

                 <td className="text-muted-foreground">
                   {new Date(
                     c.created_at
                   ).toLocaleDateString()}
                 </td>
           
               <td className="space-x-3">
                <Link
                  to="/photo/$id"
                  params={{ id: c.photo_id }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View
                </Link>
              
                <button
                  onClick={() => deleteComment(c.id)}
                                className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              
              </td>
               </tr>
             ))}
           </tbody>

          </table>
        </div>

      </div>
    </Layout>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">

      <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center">
        {icon}
      </div>

      <div>
        <div className="text-2xl font-bold text-gradient-mint">
          {value}
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}