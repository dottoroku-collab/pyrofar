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

  async function handleSubmit(values: {
    email: string;
    password: string;
  }) {
    setLoading(true);

    try {
      const res = await login(values);

      setSession(
        res.access_token,
        res.refresh_token,
        res.user
      );

      navigate("/dashboard");
    } catch (err: any) {
      message.error(
        err?.response?.data?.error?.message ??
          "Email atau password salah"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.grayPage,
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 400,
          maxWidth: "100%",
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{
          padding: 36,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          {logoUrl ? (
            <div
              style={{
                width: 92,
                height: 92,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={logoUrl}
                alt={settings.app_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: colors.redPrimary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                margin: "0 auto 14px",
                fontFamily: "Manrope, sans-serif",
                fontSize: 18,
              }}
            >
              SM
            </div>
          )}

          <Title
            level={4}
            style={{
              margin: 0,
              fontFamily: "Manrope, sans-serif",
            }}
          >
            {settings.app_name}
          </Title>

          <Text
            type="secondary"
            style={{
              display: "block",
              fontSize: 12.5,
              marginTop: 6,
            }}
          >
            {settings.organization_name}
          </Text>

          {settings.region_name && (
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 12.5,
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
            label="Email"
            rules={[
              {
                required: true,
                message: "Email wajib diisi",
              },
            ]}
          >
            <Input
              placeholder="nama@damkar.makassar.go.id"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Password wajib diisi",
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Masuk
          </Button>
        </Form>
      </Card>
    </div>
  );
}
