import { Card, Form, Input, Select, Button, message, DatePicker, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { useTokens, useThemeStore } from "@/store/themeStore";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTenantStore } from "@/store/tenantStore";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => {
        setPosition(e.target.getLatLng());
      }
    }}>
      <Popup>Lokasi bangunan</Popup>
    </Marker>
  );
}

function MapController({ center }: { center: L.LatLngExpression | null }) {
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

export default function PencegahanForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tokens = useTokens();
  const { mode } = useThemeStore();
  const { settings } = useTenantStore();

  const defaultCenter: [number, number] = (settings?.latitude && settings?.longitude) 
    ? [settings.latitude, settings.longitude]
    : [-5.147665, 119.432731];
    
  const [position, setPosition] = useState<[number, number] | null>(defaultCenter);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression | null>(defaultCenter);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        tanggal_inspeksi: values.tanggal_inspeksi.format("YYYY-MM-DD"),
        latitude: position ? position[0].toString() : null,
        longitude: position ? position[1].toString() : null,
        status: "pending",
        status_kepatuhan: "patuh", // default
      };
      await apiClient.post("/pencegahan/inspeksi", payload);
      message.success("Jadwal inspeksi berhasil ditambahkan");
      navigate("/pencegahan");
    } catch (e) {
      console.error(e);
      message.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered={false} title="Tambah Jadwal Inspeksi" style={{ background: tokens.surfaceHover }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Jenis Inspeksi" name="objek_inspeksi" rules={[{ required: true }]}>
              <Select placeholder="Pilih Jenis Inspeksi">
                <Select.Option value="Gedung Perkantoran">Gedung Perkantoran</Select.Option>
                <Select.Option value="Pabrik / Industri">Pabrik / Industri</Select.Option>
                <Select.Option value="Fasilitas Publik">Fasilitas Publik</Select.Option>
                <Select.Option value="Lainnya">Lainnya</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Nama Bangunan / Objek" name="building_name" rules={[{ required: true }]}>
              <Input placeholder="Contoh: Gedung Sate" />
            </Form.Item>

            <Form.Item label="Nama Pemilik / Penanggung Jawab" name="owner_name">
              <Input placeholder="Masukkan nama pemilik" />
            </Form.Item>

            <Form.Item label="Tanggal Inspeksi" name="tanggal_inspeksi" initialValue={dayjs()} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Alamat Lengkap" name="alamat" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Masukkan alamat lengkap..." />
            </Form.Item>

            <Form.Item label="Lokasi Peta">
              <div style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
                <MapContainer
                  center={defaultCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    url={mode === 'dark'
                      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                    }
                    attribution='&copy; CARTO'
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                  <MapController center={mapCenter} />
                </MapContainer>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Button onClick={() => navigate("/pencegahan")} style={{ marginRight: 8 }}>Batal</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: tokens.primary, borderColor: tokens.primary }}>
            Simpan Jadwal
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
