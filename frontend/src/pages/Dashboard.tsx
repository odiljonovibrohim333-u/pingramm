import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LogOut,
  Plus,
  Play,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type VideoStatus = "draft" | "generating" | "completed" | "failed";

const statusConfig: Record<
  VideoStatus,
  { icon: typeof Clock; label: string; color: string }
> = {
  draft: { icon: Clock, label: "Draft", color: "text-muted-foreground" },
  generating: {
    icon: Loader2,
    label: "Generating",
    color: "text-blue-500",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-500",
  },
  failed: { icon: AlertCircle, label: "Failed", color: "text-red-500" },
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const videos = useQuery(api.videos.list);
  const createVideo = useMutation(api.videos.create);
  const removeVideo = useMutation(api.videos.remove);
  const updateStatus = useMutation(api.videos.updateStatus);

  const [showNewVideo, setShowNewVideo] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const videoId = await createVideo({
        title: title.trim(),
        prompt: prompt.trim() || undefined,
      });

      // Simulate generation start
      await updateStatus({
        videoId,
        status: "generating",
      });

      // Simulate completion after a delay (in real app, this would be a webhook/callback)
      setTimeout(async () => {
        await updateStatus({
          videoId,
          status: "completed",
          duration: Math.floor(Math.random() * 60) + 10,
          resolution: "1080p",
        });
      }, 5000);

      setTitle("");
      setPrompt("");
      setShowNewVideo(false);
    } catch (error) {
      console.error("Failed to create video:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      await removeVideo({ videoId: videoId as any });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-foreground/70" />
            <span className="text-sm font-medium">Framecraft</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {user?.name || user?.email || "Creator"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your videos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage your video projects
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowNewVideo(true)}
          >
            <Plus className="w-4 h-4" />
            New video
          </Button>
        </div>

        {/* New Video Form */}
        <AnimatePresence>
          {showNewVideo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium">Create new video</h2>
                  </div>
                  <form onSubmit={handleCreateVideo} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Title
                      </label>
                      <Input
                        placeholder="My awesome video"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="max-w-md"
                        disabled={isCreating}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Description (optional)
                      </label>
                      <Textarea
                        placeholder="Describe what you want to create..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="max-w-md resize-none"
                        rows={3}
                        disabled={isCreating}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="submit"
                        disabled={isCreating || !title.trim()}
                        className="gap-2"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Generate video
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowNewVideo(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Videos Grid */}
        {videos === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Film className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">No videos yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first video by clicking the button above. Describe what
              you want and let AI do the rest.
            </p>
            <Button onClick={() => setShowNewVideo(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create your first video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => {
              const status = statusConfig[video.status as VideoStatus];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="border-border/60 overflow-hidden hover:border-border transition-colors">
                    <div className="aspect-video bg-gradient-to-br from-muted/80 via-background to-muted/50 relative">
                      {video.status === "completed" ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors cursor-pointer">
                            <Play className="w-5 h-5 ml-0.5" />
                          </div>
                        </div>
                      ) : video.status === "generating" ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-md bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium truncate">
                            {video.title}
                          </h3>
                          {video.prompt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {video.prompt}
                            </p>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs shrink-0 ${status.color}`}
                        >
                          <StatusIcon
                            className={`w-3 h-3 ${video.status === "generating" ? "animate-spin" : ""}`}
                          />
                          {status.label}
                        </div>
                      </div>

                      {video.duration && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{video.duration}s</span>
                          <span>{video.resolution}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
