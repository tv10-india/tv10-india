import { NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 200;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: unknown; languageCode?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const languageCode = body.languageCode === "en-US" ? "en-US" : "hi-IN";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Text is too long for one audio request" },
        { status: 413 }
      );
    }

    const query = new URLSearchParams({
      ie: "UTF-8",
      client: "tw-ob",
      tl: languageCode === "hi-IN" ? "hi" : "en",
      q: text,
    });
    const response = await fetch(`https://translate.google.com/translate_tts?${query}`, {
      headers: { Accept: "audio/mpeg" },
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Free TTS error:", response.status, details);
      return NextResponse.json(
        { error: "Text-to-speech provider failed" },
        { status: 502 }
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Text-to-speech request failed:", error);
    return NextResponse.json({ error: "Invalid text-to-speech request" }, { status: 400 });
  }
}
