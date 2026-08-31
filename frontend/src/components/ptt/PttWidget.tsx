import { useCallback } from "react";
import { Button, Space, Typography, Tooltip, Badge } from "antd";
import { AudioOutlined, AudioMutedOutlined, AudioFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { usePttStore } from "@/store/pttStore";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";

const { Text } = Typography;

export default function PttWidget() {
  const { isMuted, toggleMute, token } = usePttStore();
  const location = useLocation();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  
  // Find active speakers
  const activeSpeakers = participants.filter((p) => p.isSpeaking);

  const startTalking = useCallback(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant]);

  const stopTalking = useCallback(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
    }
  }, [localParticipant]);

  if (!token || location.pathname !== "/dashboard") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        padding: "12px 24px",
        borderRadius: 40,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        color: "white",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div style={{ minWidth: 150, display: 'flex', alignItems: 'center' }}>
        {activeSpeakers.length > 0 ? (
          <Space>
            <Badge status="processing" color="#52c41a" />
            <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
              {activeSpeakers.map(p => p.name || p.identity).join(", ")}
            </Text>
          </Space>
        ) : (
          <Space>
            <Badge status="default" />
            <Text style={{ color: "rgba(255,255,255,0.5)" }}>Standby</Text>
          </Space>
        )}
      </div>
      
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />

      <Space size="large">
        <Tooltip title={isMuted ? "Unmute Suara Masuk" : "Mute Suara Masuk"}>
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={isMuted ? <AudioMutedOutlined style={{ color: "#ff4d4f", fontSize: 20 }} /> : <AudioOutlined style={{ color: "#52c41a", fontSize: 20 }} />}
            onClick={toggleMute}
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
        </Tooltip>
        
        <Tooltip title="Tahan untuk Berbicara ke Lapangan">
          <Button
            type="primary"
            shape="circle"
            icon={<AudioFilled style={{ fontSize: 24 }} />}
            size="large"
            danger={localParticipant?.isMicrophoneEnabled}
            onMouseDown={startTalking}
            onMouseUp={stopTalking}
            onMouseLeave={stopTalking}
            style={{ 
              width: 56,
              height: 56,
              transform: localParticipant?.isMicrophoneEnabled ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              boxShadow: localParticipant?.isMicrophoneEnabled ? "0 0 20px rgba(255, 77, 79, 0.6)" : "none"
            }}
          />
        </Tooltip>
      </Space>
    </div>
  );
}
