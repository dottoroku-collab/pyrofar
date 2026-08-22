import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { getAssetUrl } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { useAppSettings } from "@/hooks/useAppSettings";
import { colors } from "@/theme/antdTheme";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const { settings } = useAppSettings();

  const logoUrl = getAssetUrl(settings.logo_url);

  useEffect(() => {
    document.title = settings.app_name;
  }, [settings.app_name]);

  async function handleSubmit(values: { email: string; password: string }) {
    setLoading(true);
    try {
      const res = await login({
        email: values.email.trim(),
        password: values.password.trim(),
      });
      setSession(res.access_token, res.refresh_token, res.user);
      navigate("/dashboard");
    } catch (err: any) {
      message.error(err?.response?.data?.error?.message ?? "Email atau password salah");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          
          .futuristic-bg {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(-45deg, #09090b, #110808, #09090b, #160a0a);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            padding: 20px;
            position: relative;
            overflow: hidden;
          }

          /* Grid Background */
          .futuristic-bg::before {
            content: '';
            position: absolute;
            width: 200vw;
            height: 200vh;
            top: -50vh;
            left: -50vw;
            background-image: 
              linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            transform: perspective(500px) rotateX(60deg) translateY(0);
            animation: gridMove 2s linear infinite;
            pointer-events: none;
            z-index: 1;
          }

          /* Glowing Orbs */
          .glow-orb-1, .glow-orb-2 {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.5;
            z-index: 0;
            pointer-events: none;
          }

          .glow-orb-1 {
            width: 40vw;
            height: 40vw;
            background: rgba(220, 38, 38, 0.3);
            top: -10%;
            left: -10%;
            animation: float1 10s infinite alternate ease-in-out;
          }

          .glow-orb-2 {
            width: 30vw;
            height: 30vw;
            background: rgba(185, 28, 28, 0.2);
            bottom: -5%;
            right: -5%;
            animation: float2 12s infinite alternate-reverse ease-in-out;
          }

          @keyframes float1 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(10%, 10%); }
          }
          
          @keyframes float2 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-10%, -10%); }
          }

          .glass-card {
            background: rgba(10, 10, 12, 0.7) !important;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(220, 38, 38, 0.2) !important;
            border-radius: 24px !important;
            box-shadow: 0 0 40px rgba(220, 38, 38, 0.1), inset 0 0 20px rgba(220, 38, 38, 0.05) !important;
            width: 420px;
            max-width: 100%;
            z-index: 10;
            position: relative;
          }
          
          /* Glow effect on the card */
          .glass-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 24px;
            padding: 1px;
            background: linear-gradient(135deg, rgba(220,38,38,0.5) 0%, rgba(220,38,38,0) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }

          .glass-input .ant-input, .glass-input .ant-input-password {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            transition: all 0.3s ease;
          }

          .glass-input .ant-input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }

          .glass-input .ant-input:focus, .glass-input .ant-input-password:focus-within {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(220, 38, 38, 0.6) !important;
            box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
          }
          
          .glass-input .ant-input-password-icon {
            color: rgba(255, 255, 255, 0.6) !important;
          }

          .cyber-button {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
            border: none !important;
            color: white !important;
            font-weight: 700 !important;
            letter-spacing: 0.5px;
            box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3) !important;
            border-radius: 12px !important;
            transition: all 0.3s ease !important;
            height: 48px !important;
            text-transform: uppercase;
            font-size: 14px !important;
          }

          .cyber-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(220, 38, 38, 0.5) !important;
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
          }

          .label-text {
            color: rgba(255, 255, 255, 0.85) !important;
            font-weight: 500 !important;
          }
        `}
      </style>

      <div className="futuristic-bg">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
        
        <Card
          className="glass-card"
          bodyStyle={{ padding: "48px 36px" }}
          bordered={false}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            {logoUrl ? (
              <div
                style={{
                  width: 96,
                  height: 96,
                  margin: "0 auto 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0, 0, 0, 0.4)",
                  borderRadius: "24px",
                  padding: "16px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.2), inset 0 0 10px rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)"
                }}
              >
                <img
                  src={logoUrl}
                  alt={settings.app_name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0px 0px 8px rgba(220, 38, 38, 0.5))"
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  margin: "0 auto 20px",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 22,
                  boxShadow: "0 8px 24px rgba(220, 38, 38, 0.3)",
                }}
              >
                SM
              </div>
            )}

            <Title
              level={3}
              style={{
                margin: 0,
                fontFamily: "Manrope, sans-serif",
                color: "#ffffff",
                letterSpacing: "-0.5px"
              }}
            >
              {settings.app_name}
            </Title>

            <Text
              style={{
                display: "block",
                fontSize: 14,
                marginTop: 8,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500
              }}
            >
              {settings.organization_name}
            </Text>

            {settings.region_name && (
              <Text
                style={{
                  display: "block",
                  fontSize: 13,
                  marginTop: 2,
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              >
                {settings.region_name}
              </Text>
            )}
          </div>

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Email wajib diisi" }]}
              label={<span className="label-text">Email Akses</span>}
            >
              <Input
                className="glass-input"
                placeholder="nama@damkar.makassar.go.id"
                size="large"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password wajib diisi" }]}
              label={<span className="label-text">Kata Sandi</span>}
            >
              <Input.Password
                className="glass-input"
                placeholder="••••••••"
                size="large"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <div style={{ marginTop: 32 }}>
              <Button
                className="cyber-button"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Autentikasi Sistem
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
