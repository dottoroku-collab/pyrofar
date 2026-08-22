import { Card, Col, Row, Typography, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTokens } from "@/store/themeStore";
import { SafetyCertificateOutlined, CheckSquareOutlined, FileTextOutlined } from "@ant-design/icons";
import { apiClient } from "@/api/client";

const { Text } = Typography;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPencegahan() {
  const tokens = useTokens();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Basic stats for prevention
    const fetchStats = async () => {
      try {
        const [inspeksiRes, edukasiRes] = await Promise.all([
          apiClient.get("/pencegahan/inspeksi"),
          apiClient.get("/edukasi/")
        ]);
        
        const inspeksi = inspeksiRes.data;
        const edukasi = edukasiRes.data;
        
        setStats({
          totalInspeksi: inspeksi.length,
          patuh: inspeksi.filter((i: any) => i.status_kepatuhan === 'patuh').length,
          totalEdukasi: edukasi.length,
          edukasiSelesai: edukasi.filter((e: any) => e.status === 'completed').length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading || !stats) return (
    <div style={{ padding: 24 }}>
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(135deg, ${tokens.success}, ${tokens.success}80)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${tokens.success}40`
        }}>
          <SafetyCertificateOutlined style={{ fontSize: 28, color: "#fff" }} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: tokens.textPrimary, fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>DASHBOARD PENCEGAHAN</h2>
          <Text style={{ color: tokens.textMuted, fontSize: 14 }}>Real-time Prevention & Inspections</Text>
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Total Inspeksi</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <CheckSquareOutlined style={{ color: tokens.primary, marginRight: 12 }} />
                {stats.totalInspeksi}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Gedung Patuh</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <SafetyCertificateOutlined style={{ color: tokens.success, marginRight: 12 }} />
                {stats.patuh}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Total Edukasi</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <FileTextOutlined style={{ color: tokens.warning, marginRight: 12 }} />
                {stats.totalEdukasi}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}
