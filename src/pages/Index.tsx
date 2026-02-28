import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Link2, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Link2,
    title: "One link for everything",
    description: "Share all your important links in one beautiful, customizable page.",
  },
  {
    icon: Heart,
    title: "Accept tips & support",
    description: "Let your audience support you with a built-in tip button on every page.",
  },
  {
    icon: Sparkles,
    title: "Beautiful by default",
    description: "No design skills needed. Every page looks stunning out of the box.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link to="/" className="text-2xl font-serif text-foreground tracking-tight">
          linkhub
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            See demo
          </Link>
          <Button size="sm">Get started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Your links, your way
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight mb-6">
            All your links.
            <br />
            <span className="text-primary">One page.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Create a beautiful link page in seconds. Share it everywhere. 
            Let your fans tip you — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <Link to="/auth">Create your page <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8">
              <Link to="/demo">See example</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Preview card */}
      <section className="max-w-lg mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-surface-elevated rounded-2xl shadow-xl border border-border p-8"
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              🎨
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">@janedoe</p>
              <p className="text-sm text-muted-foreground">Designer & creator</p>
            </div>
          </div>
          <div className="space-y-3">
            {["Portfolio", "Twitter / X", "Latest project"].map((label) => (
              <div
                key={label}
                className="w-full py-3.5 px-5 rounded-xl bg-card border border-border text-center text-sm font-medium text-foreground hover:border-primary/40 transition-colors cursor-pointer"
              >
                {label}
              </div>
            ))}
            <div className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--tip-gradient-to))] text-center text-sm font-semibold text-primary-foreground cursor-pointer">
              ☕ Tip me
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with ❤️ — linkhub © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
