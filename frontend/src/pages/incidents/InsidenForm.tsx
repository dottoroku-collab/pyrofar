import { Form, Input, Select, Button, message, DatePicker, Radio, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { SearchOutlined, AlertOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

interface InsidenFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultJenis: "pemadaman" | "penyelamatan";
}

import { useThemeStore } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";

export default function InsidenForm({ onSuccess, onCancel, defaultJenis }: InsidenFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchingMap, setSearchingMap] = useState(false);
  
  const { settings } = useTenantStore();
  const defaultCenter = (settings?.latitude && settings?.longitude) 
    ? [settings.latitude, settings.longitude] as [number, number]
    : [-5.147665, 119.432731] as [number, number];
    
  const [position, setPosition] = useState<[number, number] | null>(defaultCenter);
  const { mode } = useThemeStore();

  useEffect(() => {
    form.setFieldsValue({
      jenis_insiden: defaultJenis,
      waktu_lapor: dayjs()
    });
  }, [defaultJenis, form]);

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
    setLoading(true);
    try {
      const payload = {
        ...values,
        waktu_lapor: values.waktu_lapor ? values.waktu_lapor.toISOString() : new Date().toISOString(),
        latitude: position ? position[0].toString() : null,
        longitude: position ? position[1].toString() : null
      };
      await apiClient.post("/insiden/", payload);
      message.success("Insiden berhasil dilaporkan!");
      onSuccess();
    } catch (e: any) {
      console.error(e);
      message.error("Gagal menambahkan insiden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} size="large">
      {/* jenis_insiden is hidden but still submitted */}
      <Form.Item name="jenis_insiden" hidden>
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="waktu_lapor" label={<strong style={{fontSize: 16}}>Waktu Lapor</strong>} rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%', height: 45 }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="pelapor_nama" label={<strong style={{fontSize: 16}}>Nama Pelapor</strong>} rules={[{ required: true }]}>
            <Input autoFocus placeholder="Nama panggilan pelapor" style={{ height: 45, fontSize: 16 }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="pelapor_kontak" label={<strong style={{fontSize: 16}}>No. Kontak / HP</strong>} rules={[{ required: true }]}>
            <Input placeholder="08XXXXXXXXXX" style={{ height: 45, fontSize: 16 }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="pelapor_alamat" label={<strong style={{fontSize: 16}}>Alamat Lengkap Pelapor</strong>} rules={[{ required: true }]}>
        <Input.TextArea rows={2} placeholder="RT/RW, Kelurahan, Kecamatan, Kab/Kota" style={{ fontSize: 16 }} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="kategori" label={<strong style={{fontSize: 16}}>Kategori Spesifik</strong>} rules={[{ required: true }]}>
            {defaultJenis === "pemadaman" ? (
              <Select placeholder="Pilih Kategori" style={{ height: 45, fontSize: 16 }}>
                <Select.Option value="Listrik">Listrik</Select.Option>
                <Select.Option value="Tabung Gas/Kompor">Tabung Gas/Kompor</Select.Option>
                <Select.Option value="Lilin / Obat Nyamuk">Lilin / Obat Nyamuk</Select.Option>
                <Select.Option value="Sampah Alang Alang">Sampah Alang Alang</Select.Option>
                <Select.Option value="Lainnya">Lainnya</Select.Option>
              </Select>
            ) : (
              <Input placeholder="Mis: Evakuasi Hewan, Pohon Tumbang" style={{ height: 45, fontSize: 16 }} />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="objek" label={<strong style={{fontSize: 16}}>Objek Kejadian</strong>} rules={[{ required: true }]}>
            {defaultJenis === "pemadaman" ? (
              <Select placeholder="Pilih Objek" style={{ height: 45, fontSize: 16 }}>
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
              <Input placeholder="Mis: Kucing, Rumah" style={{ height: 45, fontSize: 16 }} />
            )}
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label={<strong style={{fontSize: 16}}>Alamat Kejadian</strong>}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Form.Item name="alamat" noStyle rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Sebutkan patokan alamat sejelas mungkin" style={{ flex: 1, fontSize: 16 }} />
          </Form.Item>
          <Button onClick={searchAddress} loading={searchingMap} style={{ height: 'auto', width: 120, fontSize: 14 }} icon={<SearchOutlined />}>
            Cari Map
          </Button>
        </div>
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <div style={{ height: 180, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url={mode === 'dark'
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <MapController center={position} />
          </MapContainer>
        </div>
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <Button onClick={onCancel} size="large" style={{ width: 150, height: 50, fontSize: 16, fontWeight: 'bold' }}>
          BATAL
        </Button>
        <Button type="primary" danger htmlType="submit" loading={loading} icon={<AlertOutlined />} size="large" style={{ height: 50, fontSize: 18, fontWeight: 900, padding: '0 40px' }}>
          KIRIM LAPORAN
        </Button>
      </div>
    </Form>
  );
}
