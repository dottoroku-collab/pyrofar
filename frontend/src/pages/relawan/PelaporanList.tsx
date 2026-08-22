import React, { useState } from "react";
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, message, DatePicker } from "antd";
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Report {
  id: string;
  tanggal: string;
  pelapor: string;
  deskripsi: string;
  lokasi: string;
  status: 'pending' | 'verified' | 'rejected';
}

const mockReports: Report[] = [
  { id: '1', tanggal: '2023-10-01', pelapor: 'Budi Santoso', deskripsi: 'Pohon tumbang di pesisir', lokasi: 'Pantai Indah', status: 'pending' },
  { id: '2', tanggal: '2023-10-02', pelapor: 'Siti Aminah', deskripsi: 'Tumpahan minyak ringan', lokasi: 'Dermaga 2', status: 'verified' },
];

export default function PelaporanList() {
  const [data, setData] = useState<Report[]>(mockReports);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleVerify = (id: string, isVerified: boolean) => {
    setData(data.map(item => item.id === id ? { ...item, status: isVerified ? 'verified' : 'rejected' } : item));
    message.success(`Laporan telah ${isVerified ? 'diverifikasi' : 'ditolak'}`);
  };

  const columns = [
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    { title: "Pelapor", dataIndex: "pelapor", key: "pelapor" },
    { title: "Deskripsi", dataIndex: "deskripsi", key: "deskripsi", render: (text: string) => <Text>{text}</Text> },
    { title: "Lokasi", dataIndex: "lokasi", key: "lokasi" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === 'pending' ? 'orange' : status === 'verified' ? 'green' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: Report) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button type="link" icon={<CheckCircleOutlined />} style={{ color: '#10b981' }} onClick={() => handleVerify(record.id, true)}>Verifikasi</Button>
              <Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => handleVerify(record.id, false)}>Tolak</Button>
            </>
          )}
          <Button type="text" icon={<EyeOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: '#f0f9ff', minHeight: '100vh' }}>
      <Title level={2} style={{ color: '#0369a1' }}>Pelaporan Masyarakat</Title>
      <Text type="secondary" style={{ color: '#0284c7' }}>Daftar laporan dari relawan dan masyarakat pesisir</Text>
      
      <Card bordered={false} style={{ marginTop: 24, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <Table columns={columns} dataSource={data} rowKey="id" />
      </Card>
    </div>
  );
}
