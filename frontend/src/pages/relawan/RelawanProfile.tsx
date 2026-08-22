import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Tabs, Table, Tag, Button, Spin, Row, Col, Avatar } from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { useTokens } from "@/store/themeStore";

export default function RelawanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRelawan();
    }
  }, [id]);

  const fetchRelawan = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/relawan/relawan/${id}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  const items = [
    {
      key: '1',
      label: 'Skills',
      children: (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.skills?.map((s: string, i: number) => (
            <Tag key={i} color="blue">{s}</Tag>
          ))}
          {(!data.skills || data.skills.length === 0) && "Belum ada skill spesifik."}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Trainings',
      children: (
        <Table
          dataSource={data.trainings || []}
          columns={[
            { title: 'Nama Pelatihan', dataIndex: 'nama', key: 'nama' },
            { title: 'Tahun', dataIndex: 'tahun', key: 'tahun' },
            { title: 'Penyelenggara', dataIndex: 'penyelenggara', key: 'penyelenggara' }
          ]}
          rowKey={(r, i) => i?.toString() || ""}
          pagination={false}
        />
      ),
    },
    {
      key: '3',
      label: 'Certifications',
      children: (
        <Table
          dataSource={data.certifications || []}
          columns={[
            { title: 'Sertifikat', dataIndex: 'nama', key: 'nama' },
            { title: 'Nomor', dataIndex: 'nomor', key: 'nomor' },
            { title: 'Masa Berlaku', dataIndex: 'berlaku_sampai', key: 'berlaku_sampai' }
          ]}
          rowKey={(r, i) => i?.toString() || ""}
          pagination={false}
        />
      ),
    },
    {
      key: '4',
      label: 'Activity & Incident',
      children: (
        <Table
          dataSource={data.incident_participation || []}
          columns={[
            { title: 'Insiden', dataIndex: 'insiden_id', key: 'insiden' },
            { title: 'Peran', dataIndex: 'peran', key: 'peran' },
            { title: 'Tanggal', dataIndex: 'tanggal', key: 'tanggal' }
          ]}
          rowKey={(r, i) => i?.toString() || ""}
          pagination={false}
        />
      ),
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/relawan')} />
        <h2 style={{ margin: 0, color: tokens.textPrimary }}>Profil Relawan</h2>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={100} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <h3 style={{ margin: 0 }}>{data.nama}</h3>
              <p style={{ color: tokens.textMuted }}>{data.komunitas}</p>
              <Tag color={data.status === 'active' ? 'green' : data.status === 'in_mission' ? 'orange' : 'default'}>
                {data.status?.toUpperCase()}
              </Tag>
            </div>

            <Descriptions column={1} size="small" layout="vertical">
              <Descriptions.Item label="Telepon">{data.biodata?.telepon || '-'}</Descriptions.Item>
              <Descriptions.Item label="Alamat">{data.biodata?.alamat || '-'}</Descriptions.Item>
              <Descriptions.Item label="Gol. Darah">{data.biodata?.golongan_darah || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
