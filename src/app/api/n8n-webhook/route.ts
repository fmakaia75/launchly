import { NextResponse } from "next/server";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ?? "http://localhost:5678/webhook-test/e32d9150-7c23-4e30-b20b-dceecc6f6f2c";

export async function POST(request: Request) {
  let bodyText: string | undefined;
  try {
    const json = await request.json();
    bodyText = JSON.stringify(json);
  } catch {
    bodyText = undefined;
  }

  const upstreamResponse = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: bodyText ? { "content-type": "application/json" } : undefined,
    body: bodyText
  });

  const text = await upstreamResponse.text();
  return new NextResponse(text, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") ?? "text/plain; charset=utf-8"
    }
  });
}
