import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ExternalLink, LogOut, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type LinkRow = Tables<"links">;

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);

  // New link form
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEmoji, setNewEmoji] = useState("🔗");

  // Profile editing
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("😊");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [profileRes, linksRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("links").select("*").eq("user_id", user.id).order("position"),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setDisplayName(profileRes.data.display_name);
      setBio(profileRes.data.bio);
      setUsername(profileRes.data.username);
      setAvatarEmoji(profileRes.data.avatar_emoji);
    }
    if (linksRes.data) setLinks(linksRes.data);
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, username, avatar_emoji: avatarEmoji })
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  const addLink = async () => {
    if (!user || !newTitle || !newUrl) return;
    const { error } = await supabase.from("links").insert({
      user_id: user.id,
      title: newTitle,
      url: newUrl,
      emoji: newEmoji,
      position: links.length,
    });
    if (error) toast.error(error.message);
    else {
      setNewTitle("");
      setNewUrl("");
      setNewEmoji("🔗");
      fetchData();
      toast.success("Link added!");
    }
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else fetchData();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link to="/" className="text-2xl font-serif text-foreground tracking-tight">
          linkhub
        </Link>
        <div className="flex items-center gap-3">
          {profile && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/${profile.username}`} className="gap-2">
                <Eye className="w-4 h-4" /> View page
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif text-foreground mb-8">Your dashboard</h1>

          {/* Profile section */}
          <section className="bg-surface-elevated rounded-2xl border border-border p-6 mb-8">
            <h2 className="text-lg font-serif text-foreground mb-4">Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Avatar emoji</Label>
                <Input value={avatarEmoji} onChange={(e) => setAvatarEmoji(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Bio</Label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world about you" className="mt-1.5" />
              </div>
            </div>
            <Button onClick={updateProfile} className="mt-4" size="sm">
              Save profile
            </Button>
          </section>

          {/* Add link */}
          <section className="bg-surface-elevated rounded-2xl border border-border p-6 mb-8">
            <h2 className="text-lg font-serif text-foreground mb-4">Add a link</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-16 text-center"
                maxLength={2}
              />
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Link title"
                className="flex-1"
              />
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button onClick={addLink} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </section>

          {/* Links list */}
          <section className="bg-surface-elevated rounded-2xl border border-border p-6">
            <h2 className="text-lg font-serif text-foreground mb-4">
              Your links ({links.length})
            </h2>
            {links.length === 0 ? (
              <p className="text-muted-foreground text-sm">No links yet. Add your first one above!</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-card border border-border"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-lg">{link.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{link.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => deleteLink(link.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
