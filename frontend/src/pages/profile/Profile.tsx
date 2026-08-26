import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  message,
  InputNumber,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/authStore";
import { getMyTenantSettings, updateMyTenantSettings } from "@/api/tenant";
import type { TenantSettings as AppSettings } from "@/types/tenant";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useThemeStore } from "@/store/themeStore";
import L from "leaflet";

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const { Title, Text } = Typography;

function LocationPicker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker position={position}>
      <Popup>Lokasi Markas Utama</Popup>
    </Marker>
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const { mode } = useThemeStore();
  
  const [formSKPD] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Default to Makassar
  const [mapCenter, setMapCenter] = useState<[number, number]>([-5.147665, 119.432731]);
  const [mapZoom] = useState(13);

  useEffect(() => {
    loadSKPDSettings();
  }, []);

  async function loadSKPDSettings() {
    setLoading(true);
    try {
      const data = await getMyTenantSettings();
      
      formSKPD.setFieldsValue({
        organization_name: data.organization_name,
        region_name: data.region_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address,
        personnel_count: data.personnel_count,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (data.latitude && data.longitude) {
        setMapCenter([data.latitude, data.longitude]);
      }
    } catch (err: any) {
      message.error("Gagal memuat profil instansi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSKPD(values: any) {
    setSaving(true);
    try {
      // get current settings to preserve branding
      const current = await getMyTenantSettings();
      
      const payload: AppSettings = {
        ...current,
        organization_name: values.organization_name || null,
        region_name: values.region_name || null,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        address: values.address || null,
        personnel_count: values.personnel_count || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
      };

      await updateMyTenantSettings(payload);
      message.success("Profil instansi berhasil disimpan");
      await loadSKPDSettings();
    } catch (err: any) {
      message.error("Gagal menyimpan profil instansi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Profil</Title>
        <Text type="secondary">Kelola informasi akun pengguna dan profil instansi SKPD Anda</Text>
      </div>

      <Card bordered={false}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <UserOutlined />
                  Profil Pengguna
                </span>
              ),
              children: (
                <div style={{ maxWidth: 600, marginTop: 16 }}>
                  <Form layout="vertical">
                    <Form.Item label="Nama Lengkap">
                      <Input size="large" value={user?.nama} readOnly />
                    </Form.Item>
                    <Form.Item label="Email">
                      <Input size="large" value={user?.email} readOnly />
                    </Form.Item>
                    <Form.Item label="Role">
                      <Input size="large" value={user?.role?.toUpperCase()} readOnly />
                    </Form.Item>
                  </Form>
                  <Alert message="Untuk mengubah informasi akun, silakan hubungi Administrator." type="info" showIcon />
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <BankOutlined />
                  Profil SKPD / Instansi
                </span>
              ),
              children: (
                <div style={{ marginTop: 16 }}>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Form
                      form={formSKPD}
                      layout="vertical"
                      onFinish={handleSaveSKPD}
                    >
                      <Row gutter={24}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="organization_name"
                            label="Nama Dinas / Instansi"
                            rules={[{ required: true, message: "Nama instansi wajib diisi" }]}
                          >
                            <Input size="large" placeholder="Dinas Pemadam Kebakaran & Penyelamatan" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="region_name"
                            label="Wilayah"
                          >
                            <Input size="large" placeholder="Kota Makassar" />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="contact_email"
                            label="Email Instansi"
                            rules={[{ type: "email", message: "Email tidak valid" }]}
                          >
                            <Input size="large" prefix={<MailOutlined />} placeholder="damkar@makassarkota.go.id" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="contact_phone"
                            label="Nomor Telepon"
                          >
                            <Input size="large" prefix={<PhoneOutlined />} placeholder="0411-xxxxxxx" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="personnel_count"
                            label="Jumlah Personil"
                          >
                            <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="Misal: 120" />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="address"
                            label="Alamat Lengkap"
                          >
                            <Input.TextArea rows={3} placeholder="Alamat kantor..." />
                          </Form.Item>
                        </Col>
                        
                        <Col span={24}>
                          <Title level={5}>Lokasi Markas Utama</Title>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                            Klik pada peta untuk menentukan titik koordinat markas utama. Titik ini akan menjadi pusat peta di halaman Dashboard.
                          </Text>
                          
                          <Row gutter={16} style={{ marginBottom: 12 }}>
                            <Col span={12}>
                              <Form.Item name="latitude" label="Latitude" style={{ marginBottom: 0 }}>
                                <InputNumber style={{ width: '100%' }} readOnly />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="longitude" label="Longitude" style={{ marginBottom: 0 }}>
                                <InputNumber style={{ width: '100%' }} readOnly />
                              </Form.Item>
                            </Col>
                          </Row>

                          <div style={{ height: 400, width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid #d9d9d9", marginBottom: 24 }}>
                            <MapContainer
                              center={mapCenter}
                              zoom={mapZoom}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer
                                url={mode === 'dark'
                                  ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                }
                                attribution='&copy; OpenStreetMap & CARTO'
                              />
                              <LocationPicker
                                position={[
                                  formSKPD.getFieldValue("latitude") || mapCenter[0],
                                  formSKPD.getFieldValue("longitude") || mapCenter[1],
                                ]}
                                onChange={(lat: number, lng: number) => {
                                  formSKPD.setFieldsValue({ latitude: lat, longitude: lng });
                                }}
                              />
                              <MapResizer />
                            </MapContainer>
                          </div>
                        </Col>
                      </Row>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          size="large"
                          loading={saving}
                        >
                          Simpan Profil Instansi
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
