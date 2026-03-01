"use client";

import { useState, useCallback, useRef } from "react";

interface Transcript {
  role: "user" | "assistant";
  content: string;
}

export interface UseRealtimeVoiceResult {
  status: "idle" | "connecting" | "connected" | "disconnected";
  isSpeaking: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
}

export function useRealtimeVoice(): UseRealtimeVoiceResult {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const transcriptsRef = useRef<Transcript[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      setStatus("connecting");
      transcriptsRef.current = [];

      // 1. Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Get ephemeral token from our backend
      const tokenRes = await fetch("/api/voice/session", { method: "POST" });
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok) {
        console.error("[voice] Session endpoint error:", tokenRes.status, tokenData);
        throw new Error(tokenData.error || `Voice session failed (${tokenRes.status})`);
      }
      const { clientSecret } = tokenData;
      if (!clientSecret) throw new Error("No client secret received");

      // 3. Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 4. Set up audio playback via ontrack
      pc.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audioElRef.current = audio;
      };

      // 5. Add mic track
      const [audioTrack] = stream.getAudioTracks();
      pc.addTrack(audioTrack, stream);

      // 6. Create data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        setStatus("connected");
      };

      dc.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          await handleDataChannelMessage(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      dc.onclose = () => {
        // Data channel closed — connection ended
      };

      // 7. Create SDP offer and connect to OpenAI
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) {
        const sdpError = await sdpRes.text().catch(() => "");
        console.error("[voice] WebRTC SDP error:", sdpRes.status, sdpError);
        throw new Error(`WebRTC connection failed (${sdpRes.status})`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      console.error("[voice] startSession error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("idle");
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDataChannelMessage = useCallback(async (msg: { type: string; [key: string]: unknown }) => {
    switch (msg.type) {
      // User speech transcribed
      case "conversation.item.input_audio_transcription.completed": {
        const transcript = (msg as { transcript?: string }).transcript;
        if (transcript) {
          transcriptsRef.current.push({ role: "user", content: transcript });
        }
        break;
      }

      // Assistant speech transcript complete (GA event name)
      case "response.output_audio_transcript.done": {
        const transcript = (msg as { transcript?: string }).transcript;
        if (transcript) {
          transcriptsRef.current.push({ role: "assistant", content: transcript });
        }
        break;
      }

      // Tool call from assistant
      case "response.function_call_arguments.done": {
        const { name, call_id, arguments: args } = msg as {
          name?: string;
          call_id?: string;
          arguments?: string;
        };
        if (name && call_id) {
          try {
            const toolRes = await fetch("/api/voice/tools", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ toolName: name, callId: call_id, arguments: args }),
            });
            const { result } = await toolRes.json();

            // Send tool result back via data channel
            const dc = dcRef.current;
            if (dc && dc.readyState === "open") {
              dc.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id,
                  output: result,
                },
              }));
              // Trigger a new response after tool result
              dc.send(JSON.stringify({ type: "response.create" }));
            }
          } catch (err) {
            console.error("[voice] Tool call failed:", err);
          }
        }
        break;
      }

      // Track speaking state
      case "output_audio_buffer.speech_started": {
        setIsSpeaking(true);
        break;
      }
      case "output_audio_buffer.speech_stopped":
      case "response.audio.done": {
        setIsSpeaking(false);
        break;
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pcRef.current.close();
      pcRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const endSession = useCallback(async () => {
    cleanup();
    setStatus("disconnected");

    // Persist transcripts to chat history
    if (transcriptsRef.current.length > 0) {
      try {
        await fetch("/api/voice/transcripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcripts: transcriptsRef.current }),
        });
      } catch (err) {
        console.error("[voice] Failed to save transcripts:", err);
      }
      transcriptsRef.current = [];
    }
  }, [cleanup]);

  return { status, isSpeaking, error, startSession, endSession };
}
