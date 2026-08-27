import { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Card, Upload } from "antd";
import { PlusOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { OperatorLapangan, OperatorLapanganCreate, getOperators, createOperator, uploadOperatorFile } from "@/api/operatorLapangan";
import { armadaApi } from "@/api/armada";
import { useTokens } from "@/store/themeStore";

export default function OperatorList() {
  const [data, setData] = useState<OperatorLapangan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [armadas, setArmadas] = useState<any[]>([]);
  const [fotoFile, setFotoFile] = useState<UploadFile[]>([]);
  const [simFile, setSimFile] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const tokens = useTokens();

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const res = await getOperators();
      setData(res || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const fetchArmadas = async () => {
    try {
      const res = await armadaApi.list();
      setArmadas(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOperators();
    fetchArmadas();
  }, []);

  const handleCreate = async (values: any) => {
    setUploading(true);
    try {
      let foto_url = undefined;
      let sim_file_url = undefined;

      if (fotoFile.length > 0 && fotoFile[0].originFileObj) {
        foto_url = await uploadOperatorFile(fotoFile[0].originFileObj as File);
      }
      
      if (simFile.length > 0 && simFile[0].originFileObj) {
        sim_file_url = await uploadOperatorFile(simFile[0].originFileObj as File);
      }

      const payload: OperatorLapanganCreate = {
        nip_nik: values.nip_nik,
        nama: values.nama,
        role: values.role,
        password: values.password || undefined,
        armada_id: values.armada_id || undefined,
        sim_expiry_date: values.sim_expiry_date ? values.sim_expiry_date.format("YYYY-MM-DD") : undefined,
        foto_url,
        sim_file_url,
      };
      await createOperator(payload);
      message.success("Operator berhasil didaftarkan");
      setIsModalOpen(false);
      form.resetFields();
      setFotoFile([]);
      setSimFile([]);
      fetchOperators();
    } catch (e: any) {
      message.error(e.response?.data?.detail || "Gagal menyimpan data");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = (setter: React.Dispatch<React.SetStateAction<UploadFile[]>>): UploadProps => ({
    onRemove: (file) => {
      setter((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setter([file]);
      return false;
    },
    maxCount: 1,
  });

  const columns = [
    {
      title: "NIK / NIP",
      dataIndex: "nip_nik",
      key: "nip_nik",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Tipe Operator",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        return role === "operator_lapangan_damkar" ? (
          <Tag color="red">Pemadam Kebakaran</Tag>
        ) : (
          <Tag color="blue">Penyelamatan</Tag>
        );
      },
    },
    {
      title: "Armada yang Digunakan",
      key: "armada",
      render: (_: any, record: OperatorLapangan) => {
        if (!record.armada) return <Tag color="default">Belum ada</Tag>;
        return (
          <span>
            {record.armada.nama_armada} - <b>{record.armada.no_polisi}</b>
          </span>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: OperatorLapangan) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/operators/${record.id}`)}>
            Detail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="glass-panel"
        title="Daftar Operator Lapangan"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Tambah Operator
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Daftarkan Operator Lapangan"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="nip_nik" label="NIK / NIP (sebagai username)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nama" label="Nama Lengkap" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password Login (Opsional)">
            <Input.Password placeholder="Default: 123456" />
          </Form.Item>
          <Form.Item name="role" label="Tipe Operator" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="operator_lapangan_damkar">Pemadam Kebakaran</Select.Option>
              <Select.Option value="operator_lapangan_penyelamatan">Penyelamatan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="armada_id" label="Armada yang Digunakan">
            <Select allowClear showSearch optionFilterProp="children">
              {armadas.map((a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.nama_armada || a.kode_armada} - {a.no_polisi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sim_expiry_date" label="Masa Berlaku SIM">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Foto Profil">
            <Upload {...uploadProps(setFotoFile)} fileList={fotoFile} accept="image/*">
              <Button icon={<UploadOutlined />}>Pilih Foto</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Dokumen SIM">
            <Upload {...uploadProps(setSimFile)} fileList={simFile} accept="image/*,.pdf">
              <Button icon={<UploadOutlined />}>Pilih SIM (PDF/Gambar)</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsModalOpen(false)} disabled={uploading}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
