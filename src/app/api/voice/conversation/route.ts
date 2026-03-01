import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!agentId) {
    return NextResponse.json(
      { error: "Voice not configured — ELEVENLABS_AGENT_ID is not set" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to get signed URL: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
