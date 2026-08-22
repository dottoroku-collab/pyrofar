import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select, message, Tabs } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from "@ant-design/icons";
import { 
  getKompis, createKompi, updateKompi, deleteKompi, Kompi,
  getPletons, createPleton, updatePleton, deletePleton, Pleton,
  getRegus, createRegu, updateRegu, deleteRegu, Regu 
} from "@/api/operations";
import { getStations, Station } from "@/api/stations";

const { Title } = Typography;

export default function OrganizationList() {
  const [kompis, setKompis] = useState<Kompi[]>([]);
  const [pletons, setPletons] = useState<Pleton[]>([]);
  const [regus, setRegus] = useState<Regu[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("kompi");

  // Modals
  const [isKompiModal, setIsKompiModal] = useState(false);
  const [isPletonModal, setIsPletonModal] = useState(false);
  const [isReguModal, setIsReguModal] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formKompi] = Form.useForm();
  const [formPleton] = Form.useForm();
  const [formRegu] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [k, p, r, s] = await Promise.all([
        getKompis(),
        getPletons(),
        getRegus(),
        getStations(false)
      ]);
      setKompis(k);
      setPletons(p);
      setRegus(r);
      setStations(s);
    } catch (error) {
      message.error("Gagal memuat data organisasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Kompi
  const submitKompi = async (values: any) => {
    try {
      if (editingId) await updateKompi(editingId, values);
      else await createKompi(values);
      message.success("Berhasil menyimpan Kompi");
      setIsKompiModal(false);
      loadData();
    } catch { message.error("Gagal menyimpan Kompi"); }
  };
  
  // Handlers for Pleton
  const submitPleton = async (values: any) => {
    try {
      if (editingId) await updatePleton(editingId, values);
      else await createPleton(values);
      message.success("Berhasil menyimpan Pleton");
      setIsPletonModal(false);
      loadData();
    } catch { message.error("Gagal menyimpan Pleton"); }
  };

  // Handlers for Regu
  const submitRegu = async (values: any) => {
    try {
      if (editingId) await updateRegu(editingId, values);
      else await createRegu(values);
      message.success("Berhasil menyimpan Regu");
      setIsReguModal(false);
      loadData();
    } catch { message.error("Gagal menyimpan Regu"); }
  };

  const handleDel = async (id: number, type: 'kompi'|'pleton'|'regu') => {
    try {
      if (type === 'kompi') await deleteKompi(id);
      if (type === 'pleton') await deletePleton(id);
      if (type === 'regu') await deleteRegu(id);
      message.success("Berhasil menghapus");
      loadData();
    } catch { message.error("Gagal menghapus"); }
  };

  const items = [
    {
      key: "kompi",
      label: "Kompi",
      children: (
        <>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Title level={5}>Daftar Kompi</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); formKompi.resetFields(); setIsKompiModal(true); }}>
              Tambah Kompi
            </Button>
          </div>
          <Table 
            dataSource={kompis} 
            rowKey="id" 
            loading={loading}
            columns={[
              { title: "Nama Kompi", dataIndex: "nama" },
              { title: "Deskripsi", dataIndex: "deskripsi" },
              { title: "Aksi", render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); formKompi.setFieldsValue(record); setIsKompiModal(true); }} />
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDel(record.id, 'kompi')} />
                </Space>
              )}
            ]}
          />
        </>
      )
    },
    {
      key: "pleton",
      label: "Pleton",
      children: (
        <>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Title level={5}>Daftar Pleton</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); formPleton.resetFields(); setIsPletonModal(true); }}>
              Tambah Pleton
            </Button>
          </div>
          <Table 
            dataSource={pletons} 
            rowKey="id" 
            loading={loading}
            columns={[
              { title: "Nama Pleton", dataIndex: "nama" },
              { title: "Kompi", render: (_, record) => record.kompi?.nama || "-" },
              { title: "Deskripsi", dataIndex: "deskripsi" },
              { title: "Aksi", render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); formPleton.setFieldsValue(record); setIsPletonModal(true); }} />
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDel(record.id, 'pleton')} />
                </Space>
              )}
            ]}
          />
        </>
      )
    },
    {
      key: "regu",
      label: "Regu",
      children: (
        <>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Title level={5}>Daftar Regu</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); formRegu.resetFields(); setIsReguModal(true); }}>
              Tambah Regu
            </Button>
          </div>
          <Table 
            dataSource={regus} 
            rowKey="id" 
            loading={loading}
            columns={[
              { title: "Nama Regu", dataIndex: "nama" },
              { title: "Pleton", render: (_, record) => record.pleton?.nama || "-" },
              { title: "Station / Posko", render: (_, record) => stations.find(s => s.id === record.station_id?.toString())?.nama || "Mako" },
              { title: "Deskripsi", dataIndex: "deskripsi" },
              { title: "Aksi", render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); formRegu.setFieldsValue(record); setIsReguModal(true); }} />
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDel(record.id, 'regu')} />
                </Space>
              )}
            ]}
          />
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <ApartmentOutlined style={{ fontSize: 24, color: "#1890ff" }} />
          <Title level={3} style={{ margin: 0 }}>Struktur Organisasi Operasional</Title>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
      </Card>

      {/* Modals */}
      <Modal title={editingId ? "Edit Kompi" : "Tambah Kompi"} open={isKompiModal} onOk={() => formKompi.submit()} onCancel={() => setIsKompiModal(false)}>
        <Form form={formKompi} layout="vertical" onFinish={submitKompi}>
          <Form.Item name="nama" label="Nama Kompi" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingId ? "Edit Pleton" : "Tambah Pleton"} open={isPletonModal} onOk={() => formPleton.submit()} onCancel={() => setIsPletonModal(false)}>
        <Form form={formPleton} layout="vertical" onFinish={submitPleton}>
          <Form.Item name="kompi_id" label="Kompi" rules={[{ required: true }]}>
            <Select>
              {kompis.map(k => <Select.Option key={k.id} value={k.id}>{k.nama}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="nama" label="Nama Pleton" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingId ? "Edit Regu" : "Tambah Regu"} open={isReguModal} onOk={() => formRegu.submit()} onCancel={() => setIsReguModal(false)}>
        <Form form={formRegu} layout="vertical" onFinish={submitRegu}>
          <Form.Item name="pleton_id" label="Pleton" rules={[{ required: true }]}>
            <Select>
              {pletons.map(p => <Select.Option key={p.id} value={p.id}>{p.nama}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="station_id" label="Station (Posko Luar)">
            <Select allowClear placeholder="Biarkan kosong jika standby di Mako">
              {stations.map(s => <Select.Option key={s.id} value={parseInt(s.id)}>{s.nama}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="nama" label="Nama Regu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
