import { Card, Col, Row, Typography, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTokens } from "@/store/themeStore";
import { CarOutlined, FireOutlined, MedicineBoxOutlined } from "@ant-design/icons";
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

export default function DashboardOperasi() {
  const tokens = useTokens();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real scenario, this would fetch from a specific operations dashboard endpoint.
    // For now, we'll fetch incidents and rescues and compute basic stats.
    const fetchStats = async () => {
      try {
        const incidentsRes = await apiClient.get("/insiden/");
        
        const incidents = incidentsRes.data || [];
        
        setStats({
          totalIncidents: incidents.filter((i: any) => i.jenis_insiden === 'pemadaman').length,
          activeIncidents: incidents.filter((i: any) => i.jenis_insiden === 'pemadaman' && (i.status === 'penanganan' || i.status === 'berangkat')).length,
          totalRescues: incidents.filter((r: any) => r.jenis_insiden === 'penyelamatan').length,
          activeRescues: incidents.filter((r: any) => r.jenis_insiden === 'penyelamatan' && (r.status === 'penanganan' || r.status === 'berangkat')).length,
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
          background: `linear-gradient(135deg, ${tokens.danger}, ${tokens.danger}80)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${tokens.danger}40`
        }}>
          <CarOutlined style={{ fontSize: 28, color: "#fff" }} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: tokens.textPrimary, fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>DASHBOARD OPERASI</h2>
          <Text style={{ color: tokens.textMuted, fontSize: 14 }}>Real-time Fire & Rescue Operations</Text>
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Total Insiden</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <FireOutlined style={{ color: tokens.danger, marginRight: 12 }} />
                {stats.totalIncidents}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Insiden Aktif</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <FireOutlined className="pulse-icon" style={{ color: tokens.danger, marginRight: 12 }} />
                {stats.activeIncidents}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Total Penyelamatan</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <MedicineBoxOutlined style={{ color: tokens.primary, marginRight: 12 }} />
                {stats.totalRescues}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>Penyelamatan Aktif</div>
              <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}>
                <MedicineBoxOutlined className="pulse-icon" style={{ color: tokens.primary, marginRight: 12 }} />
                {stats.activeRescues}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}
