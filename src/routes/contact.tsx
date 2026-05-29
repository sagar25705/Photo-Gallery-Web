// import { createFileRoute } from "@tanstack/react-router";
// import { useState } from "react";
// import { toast } from "sonner";
// import { Mail, Send } from "lucide-react";
// import { Layout } from "@/components/Layout";
// import { Button } from "@/components/ui/button";

// export const Route = createFileRoute("/contact")({ component: Contact });

// function Contact() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [msg, setMsg] = useState("");

//   const submit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const body = `From: ${name} <${email}>\n\n${msg}`;
//     window.location.href = `mailto:gaurisagar343@gmail.com?subject=${encodeURIComponent("PicZio contact from " + name)}&body=${encodeURIComponent(body)}`;
//     toast.success("Opening your email client…");
//   };

//   return (
//     <Layout withParticles>
//       <div className="mx-auto max-w-3xl px-4 py-16">
//         <h1 className="text-4xl font-bold">Get in <span className="text-gradient-mint">touch</span></h1>
//         <p className="text-muted-foreground mt-3">Questions, collabs, or print enquiries — reach out.</p>

//         <div className="mt-8 glass-strong rounded-3xl p-8 grid gap-6 md:grid-cols-[1fr_2fr]">
//           <div>
//             <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center"><Mail /></div>
//             <h3 className="font-semibold mt-3">Email</h3>
//             <a href="mailto:gaurisagar343@gmail.com" className="text-sm text-primary hover:underline">gaurisagar343@gmail.com</a>
//             <p className="text-xs text-muted-foreground mt-6">Developed by<br/><span className="text-foreground">Gauri Sagar</span></p>
//           </div>
//           <form onSubmit={submit} className="space-y-3">
//             <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none" />
//             <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none" />
//             <textarea required rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your message…" className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none" />
//             <Button type="submit" className="rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)]"><Send className="size-4 mr-1" /> Send message</Button>
//           </form>
//         </div>
//       </div>
//     </Layout>
//   );
// }






import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import emailjs from "@emailjs/browser";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !msg) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await emailjs.send(
        "service_3s7jark",
        "template_gya31h4",
        {
          name,
          email,
          message: msg,
          time: new Date().toLocaleString(),
        },
        "RWzF-qi9FKYf8TWOE"
      );

      toast.success("Message sent successfully!");

      setName("");
      setEmail("");
      setMsg("");
    } catch (error) {
      console.error("EMAIL ERROR:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout withParticles>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold">
          Get in <span className="text-gradient-mint">touch</span>
        </h1>

        <p className="text-muted-foreground mt-3">
          Questions, collabs, or print enquiries — reach out.
        </p>

        <div className="mt-8 glass-strong rounded-3xl p-8 grid gap-6 md:grid-cols-[1fr_2fr]">
          <div>
            <div className="size-12 rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)] grid place-items-center">
              <Mail />
            </div>

            <h3 className="font-semibold mt-3">Email</h3>

            <a
              href="mailto:gaurisagar343@gmail.com"
              className="text-sm text-primary hover:underline"
            >
              gaurisagar343@gmail.com
            </a>

            <p className="text-xs text-muted-foreground mt-6">
              Developed by
              <br />
              <span className="text-foreground">Gauri Sagar</span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none"
            />

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none"
            />

            <textarea
              required
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Your message…"
              className="w-full glass rounded-xl bg-transparent px-4 py-2.5 outline-none"
            />

            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--gradient-mint)] text-[var(--deep)]"
            >
              <Send className="size-4 mr-1" />

              {loading ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}