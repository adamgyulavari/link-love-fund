import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type TipStatus = "loading" | "paid" | "pending" | "failed";

const TipReturn = () => {
  const [searchParams] = useSearchParams();
  const tipId = searchParams.get("tip_id");
  const [status, setStatus] = useState<TipStatus>("loading");
  const [profileUsername, setProfileUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!tipId) {
      setStatus("failed");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const pollStatus = async () => {
      const { data: tip } = await supabase
        .from("tips")
        .select("status, profile_id")
        .eq("id", tipId)
        .single();

      if (!tip) {
        setStatus("failed");
        return;
      }

      if (tip.profile_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", tip.profile_id)
          .single();
        if (profile) setProfileUsername(profile.username);
      }

      if (tip.status === "paid") {
        setStatus("paid");
        return;
      }

      if (["failed", "canceled", "expired"].includes(tip.status)) {
        setStatus("failed");
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus(tip.status === "pending" ? "pending" : "failed");
        return;
      }

      setTimeout(pollStatus, 2000);
    };

    pollStatus();
  }, [tipId]);

  const content: Record<TipStatus, { emoji: string; title: string; subtitle: string }> = {
    loading: {
      emoji: "⏳",
      title: "Checking payment...",
      subtitle: "Hang tight while we confirm your tip.",
    },
    paid: {
      emoji: "🎉",
      title: "Thank you!",
      subtitle: "Your tip was received. You just made someone's day!",
    },
    pending: {
      emoji: "⏳",
      title: "Payment pending",
      subtitle: "Your payment is being processed. The tip will appear once confirmed.",
    },
    failed: {
      emoji: "😔",
      title: "Payment not completed",
      subtitle: "The payment was cancelled or failed. No worries — you can try again.",
    },
  };

  const c = content[status];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <div className="text-6xl mb-6">{c.emoji}</div>
        <h1 className="text-2xl font-serif text-foreground mb-2">{c.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{c.subtitle}</p>

        <div className="flex flex-col gap-3">
          {profileUsername && (
            <Button asChild variant="default">
              <Link to={`/${profileUsername}`}>Back to profile</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TipReturn;
