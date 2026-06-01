import Link from "next/link";

export default function Page() {
  return (
    <main className="relative z-10">
      <div className="min-h-screen px-6 pt-24 pb-20 flex items-start justify-center">
        <div className="w-full max-w-5xl">
          <header className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[rgb(var(--muted))] mb-6">
                AI Product Launch Studio
              </p>

              <h1 className="font-display text-[2.9rem] leading-[1.05] tracking-[-0.03em] text-[rgb(var(--ink))]">
                Turn a brief into
                <br />
                launch assets in minutes.
              </h1>

              <p className="mt-6 max-w-lg text-[13px] leading-relaxed text-[rgba(0,0,0,0.55)]">
                You type a product name, description, and audience. We generate LinkedIn posts + PixVerse-ready prompts.
                Built to plug into n8n + Ollama.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center bg-[rgb(var(--ink))] text-[rgb(var(--paper))] text-[12px] font-medium tracking-[0.08em] uppercase px-6 py-4 hover:opacity-85 transition-opacity"
                >
                  Open Studio
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center border border-[rgba(0,0,0,0.14)] text-[rgb(var(--ink))] text-[12px] font-medium tracking-[0.08em] uppercase px-6 py-4 hover:bg-[rgba(0,0,0,0.03)] transition-colors"
                >
                  Generate Campaign
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <Feature title="Brief in" desc="Name • Description • Audience" />
                <Feature title="Assets out" desc="LinkedIn posts + prompts" />
                <Feature title="Automation-ready" desc="n8n webhooks + polling page" />
              </div>
            </div>

            <div className="md:col-span-6 md:pl-6">
              <div className="border border-[rgba(0,0,0,0.10)] bg-[rgba(255,255,255,0.70)] backdrop-blur-sm p-4">
                <div className="aspect-video overflow-hidden bg-[rgba(0,0,0,0.03)]">
                  <HeroVideo />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">
                    Demo video
                  </p>
                </div>
              </div>

              <div className="mt-6 border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.55)] p-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">What you get</p>
                <ul className="mt-4 space-y-3 text-[13px] text-[rgba(0,0,0,0.65)]">
                  <li>• 3 LinkedIn posts + the prompts used to generate them</li>
                  <li>• PixVerse prompt pack (negative prompt + shot prompts)</li>
                  <li>• A results page that waits for completion and lets you copy everything</li>
                </ul>
              </div>
            </div>
          </header>

          <footer className="mt-16 pt-8 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.20)]">
              n8n · Ollama · PixVerse
            </p>
            <Link
              href="/studio"
              className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.60)]"
            >
              Start
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.55)] p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">{title}</p>
      <p className="mt-2 text-[13px] text-[rgba(0,0,0,0.60)]">{desc}</p>
    </div>
  );
}

function HeroVideo() {
  const url = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

  // If you set an https embed URL, we render it in an iframe.
  const isHttp = url?.startsWith("http");
  const isLikelyEmbed = isHttp && (url?.includes("youtube.com") || url?.includes("youtu.be") || url?.includes("vimeo.com"));

  if (url && isLikelyEmbed) {
    return (
      <iframe
        className="h-full w-full"
        src={url}
        title="Demo video"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    );
  }

  // Default: local mp4 in /public or any direct mp4 URL.
  const src = url || "/hero.mp4";
  return (
    <video className="h-full w-full object-cover" src={src} autoPlay muted loop playsInline />
  );
}
