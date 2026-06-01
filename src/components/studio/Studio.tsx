"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UploadedImage = { id: string; file: File; url: string };
type Status = "idle" | "loading" | "success" | "error";

export default function Studio() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => () => { images.forEach((x) => URL.revokeObjectURL(x.url)); }, [images]);

  const startWebhookUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_N8N_START_WEBHOOK_URL ||
      "http://localhost:5678/webhook-test/e32d9150-7c23-4e30-b20b-dceecc6f6f2c"
    );
  }, []);

  async function onGenerate() {
    if (status === "loading") return;
    setErrorMsg(null);
    setStatus("loading");

    const clientJobId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // Redirect immediately — don’t wait for n8n to finish
    router.push(`/results/${encodeURIComponent(clientJobId)}`);

    // Fire the webhook in the background
    fetch(startWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jobId: clientJobId,
        name: name.trim(),
        description: description.trim(),
        audience: audience.trim(),
        images: images.map((img) => ({ name: img.file.name, size: img.file.size, type: img.file.type })),
      }),
    }).catch(() => null);
  }

  function onImagesChange(files: FileList | null) {
    if (!files) return;
    setImages((prev) => { prev.forEach((x) => URL.revokeObjectURL(x.url)); return []; });
    setImages(
      Array.from(files).slice(0, 8).map((file, idx) => ({
        id: `${file.name}-${file.size}-${idx}`,
        file,
        url: URL.createObjectURL(file),
      }))
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-6 pt-24 pb-20">
      <div className="w-full max-w-[480px] animate-reveal-up">

        {/* Header */}
        <header className="mb-16">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[rgb(var(--muted))] mb-6">
            AI Product Launch Studio
          </p>
          <h1 className="font-display text-[2.6rem] leading-[1.08] tracking-[-0.02em] text-[rgb(var(--ink))]">
            Generate your<br />
            <em className="not-italic" style={{ fontStyle: "italic" }}>launch campaign.</em>
          </h1>
          <p className="mt-6 text-[12px] leading-relaxed text-[rgba(0,0,0,0.45)]">
            Sends your brief to n8n, then redirects to a results page that waits for the output.
          </p>
        </header>

        {/* Fields */}
        <div className="space-y-10">
          <Field number="01" label="Product name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What are you launching?"
              autoComplete="off"
              className="w-full bg-transparent border-b border-[rgba(0,0,0,0.12)] py-3 text-sm text-[rgb(var(--ink))] placeholder:text-[rgba(0,0,0,0.22)] outline-none focus:border-[rgb(var(--ink))] transition-colors duration-200"
            />
          </Field>

          <Field number="02" label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What it does. What makes it different."
              rows={3}
              className="w-full bg-transparent border-b border-[rgba(0,0,0,0.12)] py-3 text-sm text-[rgb(var(--ink))] placeholder:text-[rgba(0,0,0,0.22)] outline-none focus:border-[rgb(var(--ink))] transition-colors duration-200 resize-none"
            />
          </Field>

          <Field number="03" label="Target audience">
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Who is it for?"
              rows={2}
              className="w-full bg-transparent border-b border-[rgba(0,0,0,0.12)] py-3 text-sm text-[rgb(var(--ink))] placeholder:text-[rgba(0,0,0,0.22)] outline-none focus:border-[rgb(var(--ink))] transition-colors duration-200 resize-none"
            />
          </Field>

          <Field number="04" label="Product images">
            <label
              htmlFor="product-images"
              className="flex items-center justify-between border-b border-[rgba(0,0,0,0.12)] py-3 cursor-pointer group"
            >
              <span className="text-sm text-[rgba(0,0,0,0.30)] group-hover:text-[rgb(var(--muted))] transition-colors duration-200">
                {images.length > 0
                  ? `${images.length} file${images.length > 1 ? "s" : ""} selected`
                  : "Choose files — optional, max 8"}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                Upload
              </span>
            </label>
            <input
              id="product-images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => onImagesChange(e.target.files)}
            />
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((img) => (
                  <div key={img.id} className="h-12 w-12 overflow-hidden rounded-sm border border-[rgba(0,0,0,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.file.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        {/* Submit */}
        <div className="mt-14">
          <button
            type="button"
            onClick={onGenerate}
            disabled={status === "loading"}
            className="w-full bg-[rgb(var(--ink))] text-[rgb(var(--paper))] text-[13px] font-medium tracking-[0.06em] uppercase py-4 transition-opacity duration-200 hover:opacity-80 disabled:opacity-30 active:scale-[0.995]"
          >
            {status === "loading" ? "Sending…" : "Generate Campaign"}
          </button>

          <div className="mt-4 min-h-4 flex items-center justify-center">
            {status === "success" && (
              <p className="text-[11px] tracking-wide text-[rgb(var(--muted))]">Redirecting…</p>
            )}
            {status === "error" && (
              <p className="text-[11px] tracking-wide text-red-500">{errorMsg || "Request failed."}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-[rgba(0,0,0,0.08)]">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(0,0,0,0.20)]">
            n8n · Ollama · PixVerse
          </p>
          <p className="mt-3 text-[11px] text-[rgba(0,0,0,0.35)]">
            Start webhook: <span className="font-mono">{startWebhookUrl}</span>
          </p>
        </footer>

      </div>
    </div>
  );
}

function Field({ number, label, children }: { number: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[10px] font-mono text-[rgba(0,0,0,0.20)] tabular-nums">{number}</span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-[rgb(var(--muted))]">{label}</span>
      </div>
      {children}
    </div>
  );
}

// Results UI moved to /results/[jobId]
