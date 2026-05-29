
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  is_banned: boolean | null;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const loadProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        console.error(
          "PROFILE LOAD ERROR:",
          error
        );
        return;
      }

      setProfile(data as Profile | null);

    if ((data as any)?.is_banned) {
    await supabase.auth.signOut();

    alert(
    "Your account has been banned by the administrator."
    );

     window.location.href = "/";
     return;
    }

const { data: roles, error: roleError } =
  await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

      if (roleError) {
        console.error(
          "ROLE LOAD ERROR:",
          roleError
        );
        return;
      }

      setIsAdmin(
        (roles ?? []).some(
          (r) => r.role === "admin"
        )
      );
    } catch (err) {
      console.error("AUTH ERROR:", err);
    }
  };

  useEffect(() => {

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_e, s) => {
        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          setTimeout(() => {
            loadProfile(s.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    supabase.auth
      .getSession()
      .then(async ({ data: { session: s } }) => {

        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          await loadProfile(s.user.id);
        }

        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,

        signOut: async () => {
          await supabase.auth.signOut();
        },

        refreshProfile: async () => {
          if (user) {
            await loadProfile(user.id);
          }
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);

  if (!c) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return c;
};