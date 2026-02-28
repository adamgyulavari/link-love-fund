import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type LinkRow = Tables<"links">;

const tipAmounts = [2, 5, 10, 25];

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Tip modal
  const [showTip, setShowTip] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [tipperName, setTipperName] = useState("");
  const [tipping, setTipping] = useState(false);

  useEffect(() => {
    if (username) fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username!)
      .single();

    if (!profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", profileData.user_id)
      .order("position");

    if (linksData) setLinks(linksData);
    setLoading(false);
  };

  const handleTip = async () => {
    if (!selectedAmount || !profile) return;
    setTipping(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-tip-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profile.id,
          amount: selectedAmount,
          tipper_name: tipperName || "Anonymous",
          message: "",
          redirect_base_url: window.location.origin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || "Failed to create payment");
      }

      window.location.href = data.checkout_url;
    } catch {
      toast.error("Failed to start payment. Please try again.");
      setTipping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-serif text-foreground">Page not found</h1>
        <p className="text-muted-foreground">This username doesn't exist yet.</p>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="px-6 py-4 flex justify-between items-center max-w-lg mx-auto w-full">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← linkhub
        </Link>
        <span className="text-xs text-muted-foreground">linkhub.io/{username}</span>
      </nav>

      <main className="flex-1 flex items-start justify-center px-6 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Avatar & Bio */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center text-4xl mb-4 border-2 border-primary/20"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {profile?.avatar_emoji}
            </motion.div>
            <h1 className="text-2xl font-serif text-foreground">{profile?.display_name}</h1>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">{profile.bio}</p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3 mb-6">
            {links.map((link, i) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="group flex items-center justify-between w-full py-4 px-5 rounded-xl bg-surface-elevated border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{link.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{link.title}</span>
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </div>

          {/* Tip Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <button
              onClick={() => setShowTip(true)}
              className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--tip-gradient-to))] text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              ☕ Tip {profile?.display_name?.split(" ")[0] || "me"}
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Tip Modal */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
            onClick={() => !tipping && setShowTip(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-elevated rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif text-foreground">
                  Tip {profile?.display_name?.split(" ")[0]} ☕
                </h3>
                <button onClick={() => setShowTip(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {tipAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                      selectedAmount === amount
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              <Input
                value={tipperName}
                onChange={(e) => setTipperName(e.target.value)}
                placeholder="Your name (optional)"
                className="mb-4"
              />

              <Button onClick={handleTip} disabled={!selectedAmount || tipping} className="w-full" size="lg">
                {tipping ? "Redirecting to payment..." : selectedAmount ? `Send €${selectedAmount} tip` : "Select an amount"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure payment via Mollie
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
