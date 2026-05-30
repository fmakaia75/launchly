"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ResultPayload = {
  status?: "pending" | "done" | "error";
  error?: string;
  linkedin?: {
    posts?: string[];
    prompts?: string[];
  };
  pixverse?: {
    negative_prompt?: string;
    prompt?: string;
    shots?: Array<{ title?: string; duration?: number; prompt?: string }>;
    pack?: string;
  };
};

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  const jobId = decodeURIComponent(params.jobId);
  const [active, setActive] = useState<"linkedin" | "pixverse">("linkedin");
  const [data, setData] = useState<ResultPayload | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const resultWebhookUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_N8N_RESULT_WEBHOOK_URL || "http://localhost:5678/webhook/pixverse-result";
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: any;

    async function poll() {
      try {
        const url = `${resultWebhookUrl}?jobId=${encodeURIComponent(jobId)}`;
        const res = await fetch(url, { method: "GET", cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Result request failed: ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as ResultPayload;
        if (cancelled) return;

        setData(json);

        const status = json.status;
        if (status === "error") {
          setState("error");
          setMessage(json.error || "Generation failed.");
          return;
        }

        // If your n8n doesn't return "status", we infer done if it includes expected fields.
        const inferredDone = Boolean(json.linkedin?.posts?.length || json.pixverse?.pack || json.pixverse?.shots?.length);
        if (status === "done" || inferredDone) {
          setState("done");
          setActive(json.pixverse ? "pixverse" : "linkedin");
          return;
        }

        setState("loading");
        timer = setTimeout(poll, 2000);
      } catch (e: any) {
        if (cancelled) return;
        setState("error");
        setMessage(e?.message || "Could not fetch results.");
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, resultWebhookUrl]);

  return (
    <main className="min-h-screen flex items-start justify-center px-6 pt-24 pb-20">
      <div className="w-full max-w-[640px] animate-reveal-up">
        <header className="mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[rgb(var(--muted))] mb-6">Results</p>
          <h1 className="font-display text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-[rgb(var(--ink))]">
            Campaign output
          </h1>
          <p className="mt-4 text-[12px] leading-relaxed text-[rgba(0,0,0,0.45)]">
            Job ID: <span className="font-mono">{jobId}</span>
          </p>
        </header>

        <div className="border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.7)] backdrop-blur-sm p-6">
          {state === "loading" && (
            <div>
              <p className="text-[11px] tracking-wide text-[rgb(var(--muted))] uppercase">Loading…</p>
              <p className="mt-3 text-sm text-[rgba(0,0,0,0.55)]">
                Waiting for n8n to finish generation. This page polls your result webhook every 2 seconds.
              </p>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-2/3 bg-[rgba(0,0,0,0.05)] animate-pulse" />
                <div className="h-3 w-3/4 bg-[rgba(0,0,0,0.05)] animate-pulse" />
                <div className="h-3 w-1/2 bg-[rgba(0,0,0,0.05)] animate-pulse" />
              </div>
            </div>
          )}

          {state === "error" && (
            <div>
              <p className="text-[11px] tracking-wide text-red-600 uppercase">Error</p>
              <p className="mt-3 text-sm text-[rgba(0,0,0,0.65)]">{message || "Could not load results."}</p>
              <p className="mt-4 text-xs text-[rgba(0,0,0,0.45)]">
                Result webhook: <span className="font-mono">{resultWebhookUrl}</span>
              </p>
            </div>
          )}

          {state === "done" && data && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">Output</p>
                <div className="flex gap-2">
                  <TabButton active={active === "linkedin"} onClick={() => setActive("linkedin")}>
                    LinkedIn
                  </TabButton>
                  <TabButton active={active === "pixverse"} onClick={() => setActive("pixverse")}>
                    PixVerse
                  </TabButton>
                </div>
              </div>

              {active === "linkedin" && <LinkedInResults posts={data.linkedin?.posts || []} prompts={data.linkedin?.prompts || []} />}
              {active === "pixverse" && (
                <PixVerseResults
                  negative={data.pixverse?.negative_prompt}
                  prompt={data.pixverse?.prompt}
                  pack={data.pixverse?.pack}
                  shots={data.pixverse?.shots || []}
                />
              )}
            </div>
          )}
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-[rgba(0,0,0,0.08)] pt-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.20)]">n8n · Ollama · PixVerse</p>
          <Link
            href="/studio"
            className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.60)]"
          >
            New brief
          </Link>
        </footer>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-[10px] tracking-[0.2em] uppercase px-2 py-1 transition-colors duration-150",
        active ? "text-[rgb(var(--ink))]" : "text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.55)]"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LinkedInResults({ posts, prompts }: { posts: string[]; prompts: string[] }) {
  if (!posts.length) return <p className="mt-6 text-[12px] text-[rgba(0,0,0,0.45)]">No LinkedIn posts returned.</p>;

  return (
    <div className="mt-6 space-y-10">
      {posts.map((p, i) => (
        <div key={i}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">Post {i + 1}</p>
            <div className="flex gap-3">
              <CopyButton text={p}>Copy post</CopyButton>
              <CopyButton text={prompts[i] || ""}>Copy prompt</CopyButton>
            </div>
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.72)]">{p}</pre>
          {prompts[i] && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.65)]">
                Show prompt used
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.68)] border border-[rgba(0,0,0,0.08)] p-3">
                {prompts[i]}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

function PixVerseResults({
  negative,
  prompt,
  pack,
  shots
}: {
  negative?: string;
  prompt?: string;
  pack?: string;
  shots: Array<{ title?: string; duration?: number; prompt?: string }>;
}) {
  const hasShots = shots?.length > 0;

  return (
    <div className="mt-6 space-y-8">
      {negative && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">Negative prompt</p>
            <CopyButton text={negative}>Copy</CopyButton>
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.68)] border border-[rgba(0,0,0,0.08)] p-3">
            {negative}
          </pre>
        </div>
      )}

      {(pack || hasShots || prompt) && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">{hasShots ? "Prompt pack" : "Prompt"}</p>
            <CopyButton text={pack || prompt || ""}>Copy</CopyButton>
          </div>

          {pack ? (
            <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.72)] border border-[rgba(0,0,0,0.08)] p-3">
              {pack}
            </pre>
          ) : prompt ? (
            <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.72)] border border-[rgba(0,0,0,0.08)] p-3">
              {prompt}
            </pre>
          ) : null}
        </div>
      )}

      {hasShots && (
        <div className="space-y-6">
          {shots.map((s, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)]">
                  Shot {idx + 1}
                  {s.title ? ` — ${s.title}` : ""}
                  {s.duration ? ` (${s.duration}s)` : ""}
                </p>
                <CopyButton text={s.prompt || ""}>Copy</CopyButton>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-[rgba(0,0,0,0.72)] border border-[rgba(0,0,0,0.08)] p-3">
                {s.prompt || ""}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.6)] transition-colors duration-150"
    >
      {children}
    </button>
  );
}
