import { Form, Input, Select, Button, message, Row, Col, Typography, Card, Space } from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { SearchOutlined, AlertOutlined, FireOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { apiClient } from "@/api/client";
import { useTenantStore } from "@/store/tenantStore";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        }
      }}
    >
      <Popup>Geser pin untuk memindahkan koordinat secara manual</Popup>
    </Marker>
  );
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

const { Title, Text } = Typography;

export default function PublicLaporInsiden({ jenis }: { jenis: "pemadaman" | "penyelamatan" }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchingMap, setSearchingMap] = useState(false);
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const { settings } = useTenantStore();
  const defaultCenter = (settings?.latitude && settings?.longitude)
    ? [settings.latitude, settings.longitude] as [number, number]
    : [-5.147665, 119.432731] as [number, number];
  const [position, setPosition] = useState<[number, number] | null>(defaultCenter);
  const [success, setSuccess] = useState(false);

  // Note: tenantId should be in UUID format for the backend.
  // The route is /lapor-kebakaran/:tenantId

  const searchAddress = async () => {
    const alamat = form.getFieldValue("alamat");
    if (!alamat) {
      message.warning("Silakan isi alamat terlebih dahulu");
      return;
    }

    setSearchingMap(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(alamat)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        message.success("Lokasi ditemukan di peta!");
      } else {
        message.error("Lokasi tidak ditemukan. Silakan klik atau geser pin di peta secara manual.");
      }
    } catch (e) {
      message.error("Gagal mencari lokasi.");
    } finally {
      setSearchingMap(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!tenantId) {
      message.error("Link tidak valid (Tenant ID hilang)");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...values,
        jenis_insiden: jenis,
        waktu_lapor: new Date().toISOString(),
        latitude: position ? position[0].toString() : null,
        longitude: position ? position[1].toString() : null,
        status: "menunggu"
      };

      // Ensure API URL handles absolute correctly or prefix it manually if it uses relative
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${apiUrl}/public/lapor-insiden/${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit");
      }
      
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      message.error("Gagal melaporkan insiden");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f5f5f5' }}>
        <Card style={{ maxWidth: 500, width: '100%', textAlign: 'center', borderRadius: 16 }}>
          <AlertOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 20 }} />
          <Title level={3}>Laporan Diterima</Title>
          <Text style={{ fontSize: 16, display: 'block', marginBottom: 24 }}>
            Terima kasih, laporan Anda telah diterima dan akan segera ditindaklanjuti oleh petugas terkait.
          </Text>
          <Button type="primary" size="large" onClick={() => window.location.reload()}>Lapor Lagi</Button>
        </Card>
      </div>
    );
  }

  const isFire = jenis === "pemadaman";
  const primaryColor = isFire ? "#f5222d" : "#1890ff";

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px 0' }}>
      <Card style={{ maxWidth: 600, margin: '0 auto', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {isFire ? <FireOutlined style={{ fontSize: 48, color: primaryColor }} /> : <MedicineBoxOutlined style={{ fontSize: 48, color: primaryColor }} />}
          <Title level={3} style={{ marginTop: 12, color: primaryColor }}>
            Lapor {isFire ? "Kebakaran" : "Penyelamatan"}
          </Title>
          <Text type="secondary">Mohon isi data dengan sebenar-benarnya</Text>
        </div>

        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} size="large">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="pelapor_nama" label={<strong style={{fontSize: 14}}>Nama Pelapor</strong>} rules={[{ required: true }]}>
                <Input autoFocus placeholder="Nama Anda" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="pelapor_kontak" label={<strong style={{fontSize: 14}}>No. Handphone (Aktif)</strong>} rules={[{ required: true }]}>
                <Input placeholder="08XXXXXXXXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="pelapor_alamat" label={<strong style={{fontSize: 14}}>Alamat Lengkap Pelapor</strong>} rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="RT/RW, Kelurahan, Kecamatan, Kab/Kota" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="kategori" label={<strong style={{fontSize: 14}}>Kategori Spesifik</strong>} rules={[{ required: true }]}>
                {isFire ? (
                  <Select placeholder="Pilih Kategori">
                    <Select.Option value="Listrik">Listrik</Select.Option>
                    <Select.Option value="Tabung Gas/Kompor">Tabung Gas/Kompor</Select.Option>
                    <Select.Option value="Lilin / Obat Nyamuk">Lilin / Obat Nyamuk</Select.Option>
                    <Select.Option value="Sampah Alang Alang">Sampah Alang Alang</Select.Option>
                    <Select.Option value="Lainnya">Lainnya</Select.Option>
                  </Select>
                ) : (
                  <Input placeholder="Mis: Evakuasi Hewan" />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="objek" label={<strong style={{fontSize: 14}}>Objek Kejadian</strong>} rules={[{ required: true }]}>
                {isFire ? (
                  <Select placeholder="Pilih Objek">
                    <Select.Option value="Rumah Tinggal">Rumah Tinggal</Select.Option>
                    <Select.Option value="Toko Kios Cafe">Toko Kios Cafe</Select.Option>
                    <Select.Option value="Industri Perusahaan">Industri Perusahaan</Select.Option>
                    <Select.Option value="Gudang">Gudang</Select.Option>
                    <Select.Option value="Pasar">Pasar</Select.Option>
                    <Select.Option value="Hotel / Asrama">Hotel / Asrama</Select.Option>
                    <Select.Option value="Kantor Sekolah">Kantor Sekolah</Select.Option>
                    <Select.Option value="Kendaraan">Kendaraan</Select.Option>
                    <Select.Option value="Sampah/Alang-Alang/Dll">Sampah/Alang-Alang/Dll</Select.Option>
                  </Select>
                ) : (
                  <Input placeholder="Mis: Cincin, Pohon" />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<strong style={{fontSize: 14}}>Alamat Kejadian</strong>}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="alamat" noStyle rules={[{ required: true }]}>
                <Input placeholder="Sebutkan patokan sejelas mungkin" />
              </Form.Item>
              <Button type="primary" onClick={searchAddress} loading={searchingMap} icon={<SearchOutlined />} style={{ background: primaryColor }}>
                Cari Map
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <div style={{ height: 250, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
              <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <MapController center={position} />
              </MapContainer>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>* Geser pin di peta ke titik lokasi kejadian secara tepat</Text>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 50, fontSize: 18, fontWeight: 'bold', background: primaryColor }}>
            KIRIM LAPORAN SEKARANG
          </Button>
        </Form>
      </Card>
    </div>
  );
}
