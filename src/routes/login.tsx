import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); nav({ to: "/" }); }
  };

  return (
    <Layout withParticles>
      <div className="min-h-[80vh] grid place-items-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="size-14 rounded-2xl bg-[var(--gradient-mint)] grid place-items-center glow-mint mb-3">
              <Camera className="size-7 text-[var(--deep)]" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to <span className="text-gradient-mint">PicZio</span></h1>
            <p className="text-xs text-muted-foreground mt-1">Sign in to your account</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
            <Button type="submit" disabled={loading}
              className="w-full rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] font-semibold h-11">
              {loading ? "Signing in…" : "Log In"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}

function Field({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50"
      />
    </label>
  );
}
