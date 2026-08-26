import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Select, Upload, message, Divider, Space, Typography, Row, Col } from "antd";
import { UploadOutlined, PrinterOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@/api/client";
import { getProvinces, getRegencies, getDistricts, getVillages, Region } from "@/services/regionApi";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTenantStore } from "@/store/tenantStore";
import { useTokens } from "@/store/themeStore";

const { Title, Text } = Typography;
const { Option } = Select;

// Fix marker icon issue in react-leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const LocationMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={customIcon} /> : null;
};

export default function RelawanForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const tokens = useTokens();
  const { settings } = useTenantStore();
  const isDarkMode = tokens.surface === '#141414';
  const tileUrl = isDarkMode
    ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const defaultCenter = (settings?.latitude && settings?.longitude) 
    ? [parseFloat(settings.latitude.toString()), parseFloat(settings.longitude.toString())] as [number, number]
    : [-5.147665, 119.432731] as [number, number];

  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [position, setPosition] = useState<[number, number]>(defaultCenter);

  // Base64 Images
  const [ktpImage, setKtpImage] = useState<string | null>(null);
  const [diriImage, setDiriImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProvinces();
    if (id) {
      fetchRelawan(id);
    }
  }, [id]);

  const fetchProvinces = async () => {
    const data = await getProvinces();
    setProvinces(data);
  };

  const fetchRelawan = async (relawanId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/relawan/relawan/${relawanId}`);
      const data = res.data;
      
      form.setFieldsValue({
        nik: data.nik,
        nama: data.nama,
        no_telepon: data.no_telepon,
        alamat: data.alamat,
        pekerjaan: data.pekerjaan,
        pendidikan: data.pendidikan,
        golongan_darah: data.golongan_darah,
        provinsi: data.provinsi,
        kota: data.kota,
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan
      });
      setKtpImage(data.foto_ktp || null);
      setDiriImage(data.foto_diri || null);
      
      if (data.latitude && data.longitude) {
        setPosition([parseFloat(data.latitude), parseFloat(data.longitude)]);
      }
    } catch (e) {
      message.error("Gagal memuat data relawan.");
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (provName: string, option: any) => {
    form.setFieldsValue({ kota: undefined, kecamatan: undefined, kelurahan: undefined });
    setCities([]); setDistricts([]); setVillages([]);
    if (option?.key) {
      const data = await getRegencies(option.key);
      setCities(data);
    }
  };

  const handleCityChange = async (cityName: string, option: any) => {
    form.setFieldsValue({ kecamatan: undefined, kelurahan: undefined });
    setDistricts([]); setVillages([]);
    if (option?.key) {
      const data = await getDistricts(option.key);
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (districtName: string, option: any) => {
    form.setFieldsValue({ kelurahan: undefined });
    setVillages([]);
    if (option?.key) {
      const data = await getVillages(option.key);
      setVillages(data);
    }
  };

  const handleUpload = async (file: File, type: 'ktp' | 'diri') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'ktp') setKtpImage(base64);
      else setDiriImage(base64);
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        foto_ktp: ktpImage,
        foto_diri: diriImage,
        latitude: position[0].toString(),
        longitude: position[1].toString()
      };

      if (id) {
        await apiClient.put(`/relawan/relawan/${id}`, payload);
        message.success("Berhasil mengupdate relawan");
      } else {
        await apiClient.post(`/relawan/relawan`, payload);
        message.success("Berhasil mendaftar relawan");
      }
      navigate('/relawan');
    } catch (e) {
      console.error(e);
      message.error("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const printForm = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      <Card 
        title={<Title level={3} style={{ margin: 0 }}>Form Pendaftaran Relawan Damkar</Title>}
        extra={<Button icon={<PrinterOutlined />} onClick={printForm}>Cetak Form</Button>}
        id="print-area"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider orientation="left">Data Pribadi</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nik" label="NIK" rules={[{ required: true, message: 'Masukkan NIK' }]}>
                <Input placeholder="Contoh: 3201..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nama" label="Nama Lengkap" rules={[{ required: true, message: 'Masukkan Nama Lengkap' }]}>
                <Input placeholder="Sesuai KTP" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="no_telepon" label="Nomor Telepon / WhatsApp" rules={[{ required: true }]}>
                <Input placeholder="08..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="golongan_darah" label="Golongan Darah">
                <Select placeholder="Pilih Golongan Darah">
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="AB">AB</Option>
                  <Option value="O">O</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Informasi Pendukung</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pekerjaan" label="Pekerjaan">
                <Input placeholder="Contoh: Karyawan Swasta" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pendidikan" label="Pendidikan Terakhir">
                <Select placeholder="Pilih Pendidikan">
                  <Option value="SMA/SMK">SMA/SMK</Option>
                  <Option value="D3">D3</Option>
                  <Option value="S1">S1</Option>
                  <Option value="S2">S2</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Wilayah & Alamat Domisili</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="provinsi" label="Provinsi" rules={[{ required: true }]}>
                <Select showSearch placeholder="Pilih Provinsi" onChange={handleProvinceChange}>
                  {provinces.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="kota" label="Kota/Kabupaten" rules={[{ required: true }]}>
                <Select showSearch placeholder="Pilih Kota" onChange={handleCityChange}>
                  {cities.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="kecamatan" label="Kecamatan" rules={[{ required: true }]}>
                <Select showSearch placeholder="Pilih Kecamatan" onChange={handleDistrictChange}>
                  {districts.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="kelurahan" label="Kelurahan/Desa" rules={[{ required: true }]}>
                <Select showSearch placeholder="Pilih Kelurahan">
                  {villages.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="alamat" label="Alamat Lengkap (Jalan, RT/RW)" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="Detail alamat" />
              </Form.Item>
              
              <div style={{ marginBottom: 24 }}>
                <Text strong>Titik Koordinat Lokasi (Klik peta untuk mengubah)</Text>
                <div style={{ height: 300, width: '100%', marginTop: 8, borderRadius: 8, overflow: 'hidden' }} className="no-print">
                  <MapContainer 
                    center={defaultCenter} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url={tileUrl} />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider orientation="left" className="no-print">Upload Dokumen</Divider>
          <Row gutter={16} className="no-print">
            <Col span={12}>
              <Form.Item label="Foto KTP">
                <Upload 
                  beforeUpload={(f) => handleUpload(f, 'ktp')}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload KTP</Button>
                </Upload>
                {ktpImage && <div style={{ marginTop: 10 }}><img src={ktpImage} alt="KTP" style={{ maxHeight: 150, borderRadius: 8 }} /></div>}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Foto Diri (Setengah Badan)">
                <Upload 
                  beforeUpload={(f) => handleUpload(f, 'diri')}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Foto Diri</Button>
                </Upload>
                {diriImage && <div style={{ marginTop: 10 }}><img src={diriImage} alt="Diri" style={{ maxHeight: 150, borderRadius: 8 }} /></div>}
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right' }} className="no-print">
            <Space>
              <Button onClick={() => navigate('/relawan')}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {id ? 'Simpan Perubahan' : 'Daftar Sebagai Relawan'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </>
  );
}
