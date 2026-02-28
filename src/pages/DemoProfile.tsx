import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const profile = {
  name: "Jane Doe",
  handle: "@janedoe",
  bio: "Designer, creator & coffee enthusiast ✨",
  emoji: "🎨",
  links: [
    { label: "My Portfolio", url: "#", emoji: "🖼️" },
    { label: "Twitter / X", url: "#", emoji: "🐦" },
    { label: "Latest Blog Post", url: "#", emoji: "📝" },
    { label: "YouTube Channel", url: "#", emoji: "🎬" },
    { label: "Newsletter", url: "#", emoji: "💌" },
  ],
};

const tipAmounts = [2, 5, 10, 25];

const DemoProfile = () => {
  const [showTip, setShowTip] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [tipped, setTipped] = useState(false);

  const handleTip = () => {
    if (selectedAmount) {
      setTipped(true);
      setTimeout(() => {
        setShowTip(false);
        setTipped(false);
        setSelectedAmount(null);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Small nav */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-lg mx-auto w-full">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
        <span className="text-xs text-muted-foreground">linkhub.io/{profile.handle.slice(1)}</span>
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
              {profile.emoji}
            </motion.div>
            <h1 className="text-2xl font-serif text-foreground">{profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
          </div>

          {/* Links */}
          <div className="space-y-3 mb-6">
            {profile.links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.url}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="group flex items-center justify-between w-full py-4 px-5 rounded-xl bg-surface-elevated border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{link.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </div>

          {/* Tip Me Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <button
              onClick={() => setShowTip(true)}
              className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--tip-gradient-to))] text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              ☕ Tip {profile.name.split(" ")[0]}
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
            onClick={() => !tipped && setShowTip(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-elevated rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl"
            >
              {tipped ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-serif text-foreground mb-1">Thank you!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your ${selectedAmount} tip means the world.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-serif text-foreground">
                      Tip {profile.name.split(" ")[0]} ☕
                    </h3>
                    <button
                      onClick={() => setShowTip(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-6">
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
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleTip}
                    disabled={!selectedAmount}
                    className="w-full"
                    size="lg"
                  >
                    {selectedAmount ? `Send $${selectedAmount} tip` : "Select an amount"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Secure payment · No account needed
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoProfile;
