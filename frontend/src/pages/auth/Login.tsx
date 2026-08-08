import { useState } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/antdTheme";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  async function handleSubmit(values: { email: string; password: string }) {
    setLoading(true);
    try {
      const res = await login(values);
      setSession(res.access_token, res.refresh_token, res.user);
      navigate("/dashboard");
    } catch (err: any) {
      message.error(err?.response?.data?.error?.message ?? "Email atau password salah");
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
      }}
    >
      <Card style={{ width: 380, borderRadius: 12 }} bodyStyle={{ padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: colors.redPrimary,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              margin: "0 auto 12px",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            SM
          </div>
          <Title level={4} style={{ margin: 0, fontFamily: "Manrope, sans-serif" }}>
            SIM Armada Damkar
          </Title>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Dinas Pemadam Kebakaran &amp; Penyelamatan Kota Makassar
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Email wajib diisi" }]}
          >
            <Input placeholder="nama@damkar.makassar.go.id" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Masuk
          </Button>
        </Form>
      </Card>
    </div>
  );
}
