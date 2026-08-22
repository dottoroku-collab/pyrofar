import { useEffect } from "react";
import { LiveKitRoom, RoomAudioRenderer, useParticipants } from "@livekit/components-react";
import { usePttStore } from "@/store/pttStore";
import { apiClient, BACKEND_URL } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import PttWidget from "./PttWidget";

// Component that safely uses LiveKit hooks and syncs with Zustand
function PttSyncListener() {
  const participants = useParticipants();
  const setActiveSpeakers = usePttStore((state) => state.setActiveSpeakers);
  
  useEffect(() => {
    const speakers = participants
      .filter((p) => p.isSpeaking)
      .map((p) => ({
        identity: p.identity,
        name: p.name,
      }));
    setActiveSpeakers(speakers);
  }, [participants, setActiveSpeakers]);

  return null;
}

export default function PttProvider({ children }: { children: React.ReactNode }) {
  const { token, serverUrl, setToken, isMuted } = usePttStore();
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await apiClient.get('/ptt/token');
        const jwt = response.data.token;
        
        const url = new URL(BACKEND_URL);
        const livekitUrl = `ws://${url.hostname}:7880`;
        
        setToken(jwt, livekitUrl);
      } catch (err) {
        console.error("Failed to fetch PTT token", err);
      }
    }

    if (isAuthenticated && !token) {
      fetchToken();
    }
  }, [isAuthenticated, token, setToken]);

  if (!token || !serverUrl) {
    return <>{children}</>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={serverUrl}
      connect={true}
    >
      <PttSyncListener />
      {!isMuted && <RoomAudioRenderer />}
      <PttWidget />
      {children}
    </LiveKitRoom>
  );
}
