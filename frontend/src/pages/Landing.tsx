import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Film,
  Zap,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.svg";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Transform text prompts into polished videos with advanced AI models.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "From concept to completion in minutes, not hours.",
  },
  {
    icon: Film,
    title: "Professional Quality",
    description: "Studio-grade output ready for any platform or presentation.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Framecraft" className="w-7 h-7" />
            <span className="text-base font-medium tracking-tight">Framecraft</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => navigate("/auth")}
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse" />
            Now in public beta
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Create videos
            <br />
            <span className="text-muted-foreground">with words</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Framecraft turns your ideas into professional videos. Describe what
            you want, and watch it come to life—no editing skills required.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              className="gap-2 px-6"
              onClick={() => navigate("/auth")}
            >
              Start creating
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 text-muted-foreground"
            >
              <Play className="w-4 h-4" />
              Watch demo
            </Button>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="aspect-video bg-gradient-to-br from-muted/80 via-background to-muted/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-muted-foreground ml-0.5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your video will appear here
                </p>
              </div>
            </div>
            <div className="h-1 bg-foreground/5">
              <motion.div
                className="h-full bg-foreground/20"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border/50">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={item} className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Simple by design
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Everything you need to go from idea to video, nothing you don't.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="p-6 rounded-xl border border-border/60 bg-card/50 hover:bg-card transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <h3 className="text-base font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Three steps. That's it.
            </h2>
            <p className="text-muted-foreground">
              No tutorials to watch. No software to learn.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Describe your video",
                desc: "Write a prompt explaining what you want to create. Be as simple or detailed as you like.",
              },
              {
                step: "02",
                title: "AI generates it",
                desc: "Our models interpret your vision and render a polished video in minutes.",
              },
              {
                step: "03",
                title: "Download and share",
                desc: "Export in multiple formats and resolutions. Ready for any platform.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-6 p-6 rounded-xl bg-background border border-border/60"
              >
                <span className="text-2xl font-light text-muted-foreground/60 tabular-nums">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-base font-medium mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Ready to create?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start turning your ideas into videos today. Free to get started.
          </p>
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() => navigate("/auth")}
          >
            Get started free
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Framecraft" className="w-5 h-5 opacity-60" />
            <span className="text-sm text-muted-foreground">
              © 2026 Framecraft
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
