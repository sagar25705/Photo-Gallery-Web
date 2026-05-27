import { Link } from "@tanstack/react-router";
import { Heart, Download } from "lucide-react";
import { motion } from "framer-motion";

export type Photo = {
  id: string;
  image_url: string;
  title: string;
  category: string | null;
  tags: string[] | null;
  likes_count: number;
  downloads_count: number;
  user_id: string;
  profiles?: { username: string | null; name: string | null; avatar_url: string | null } | null;
};

export function PhotoCard({ photo, idx = 0 }: { photo: Photo; idx?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(idx * 0.04, 0.4) }}
      className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl glass"
    >
      <Link to="/photo/$id" params={{ id: photo.id }} className="block">
        <img
          src={photo.image_url}
          alt={photo.title}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg drop-shadow">{photo.title}</h3>
            {photo.profiles?.username && (
              <p className="text-white/80 text-xs mt-1">@{photo.profiles.username}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {(photo.tags ?? []).slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/30 text-primary border border-primary/40">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-white/90 text-xs">
              <span className="flex items-center gap-1"><Heart className="size-3.5" />{photo.likes_count}</span>
              <span className="flex items-center gap-1"><Download className="size-3.5" />{photo.downloads_count}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
