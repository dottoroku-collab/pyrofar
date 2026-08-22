import {
  AppstoreOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
  WhatsAppOutlined,
  SendOutlined,
  ApiOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Upload,
  Switch,
  Select,
  Alert,
  Tooltip,
  message,
} from "antd";

import { useEffect, useState } from "react";
import { getAssetUrl } from "@/api/client";
import { getMyTenantSettings, updateMyTenantSettings, uploadDashboardMedia, uploadLogo, testWhatsAppGateway } from "@/api/tenant";
import { settingsApi } from "@/api/settings";
import type { TenantSettings as AppSettings } from "@/types/tenant";
import { useTenantStore } from "@/store/tenantStore";

import LogoCropModal from "@/components/settings/LogoCropModal";
import MediaCropModal from "@/components/settings/MediaCropModal";
import LocationPicker from "./LocationPicker";


const { Title, Text } = Typography;

export default function Pengaturan() {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [mediaCropOpen, setMediaCropOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);

  const [testingWA, setTestingWA] = useState(false);

  async function loadSettings() {
    setLoading(true);

    try {
      const data = await getMyTenantSettings();

      form.setFieldsValue({
        ...data,
        primary_color: data.primary_color || "#C62828",
        secondary_color: data.secondary_color || "#263238",
        wa_enabled: data.wa_enabled !== undefined ? data.wa_enabled : true,
        wa_provider: data.wa_provider || "fonnte",
        wa_api_url: data.wa_api_url || "https://api.fonnte.com/send",
        wa_instance_name: data.wa_instance_name || "sim-armada",
      });
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal memuat pengaturan aplikasi"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleLogoSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      message.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ukuran logo maksimal 5 MB");
      return;
    }

    const url = URL.createObjectURL(file);

    setLogoPreview(url);
    setLogoCropOpen(true);
  }

  async function handleLogoConfirm(file: File) {
    setLogoUploading(true);

    try {
      const data = await uploadLogo(file);

      form.setFieldValue("logo_url", data.logo_url);

      message.success("Logo berhasil diperbarui");

      setLogoCropOpen(false);

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoPreview(null);

      await loadSettings();
      await useTenantStore.getState().fetchTenant();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal mengunggah logo"
      );
    } finally {
      setLogoUploading(false);
    }
  }

  function handleLogoCancel() {
    setLogoCropOpen(false);

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview(null);
  }

  async function handleDeleteLogo() {
    try {
      // Logo deletion is not implemented on tenant settings yet

      form.setFieldValue("logo_url", null);

      message.success("Logo berhasil dihapus");

      await loadSettings();
      await useTenantStore.getState().fetchTenant();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal menghapus logo"
      );
    }
  }

  async function handleMediaSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      message.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ukuran gambar maksimal 5 MB");
      return;
    }

    const url = URL.createObjectURL(file);

    setMediaPreview(url);
    setMediaCropOpen(true);
  }

  async function handleMediaConfirm(file: File) {
    setMediaUploading(true);

    try {
      const data = await uploadDashboardMedia(file);

      form.setFieldValue("dashboard_image_url", data.dashboard_image_url);

      message.success("Gambar dashboard berhasil diperbarui");

      setMediaCropOpen(false);

      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }

      setMediaPreview(null);

      await loadSettings();
      await useTenantStore.getState().fetchTenant();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal mengunggah gambar dashboard"
      );
    } finally {
      setMediaUploading(false);
    }
  }

  function handleMediaCancel() {
    setMediaCropOpen(false);

    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaPreview(null);
  }

  async function handleDeleteMedia() {
    try {
      form.setFieldValue("dashboard_image_url", null);
      message.success("Gambar media dihapus sementara, tekan simpan untuk menetapkan penghapusan");
    } catch (err: any) {
      console.error(err);
    }
  }

  async function handleTestWhatsApp() {
    const wa_target = form.getFieldValue("wa_siaga_target");
    if (!wa_target) {
      message.warning("Silakan isi Target Nomor / Grup WhatsApp terlebih dahulu untuk melakukan uji coba.");
      return;
    }

    setTestingWA(true);
    try {
      const values = form.getFieldsValue();
      const res = await testWhatsAppGateway({
        target: values.wa_siaga_target,
        provider: values.wa_provider,
        api_token: values.wa_api_token,
        api_url: values.wa_api_url,
        instance_name: values.wa_instance_name,
      });

      if (res.success) {
        message.success(res.message || "Pesan uji coba WhatsApp berhasil dikirim ke target!", 4);
      } else {
        message.error(res.message || "Gagal mengirim pesan uji coba WhatsApp", 7);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Gagal mengirim uji coba", 7);
    } finally {
      setTestingWA(false);
    }
  }

  async function handleSubmit(values: AppSettings) {
    setSaving(true);

    try {
      const current = await getMyTenantSettings();
      const payload = {
        ...current,
        app_name: values.app_name,
        app_short_name: values.app_short_name,
        logo_url: values.logo_url || null,
        primary_color: values.primary_color || "#C62828",
        secondary_color: values.secondary_color || "#263238",
        organization_name: values.organization_name || null,
        region_name: values.region_name || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        personnel_count: values.personnel_count || null,
        address: values.address || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        dashboard_video_url: values.dashboard_video_url || null,
        dashboard_image_url: values.dashboard_image_url || null,
        dashboard_running_text: values.dashboard_running_text || null,

        // WhatsApp Gateway
        wa_enabled: values.wa_enabled !== undefined ? values.wa_enabled : true,
        wa_provider: values.wa_provider || "fonnte",
        wa_api_token: values.wa_api_token || null,
        wa_api_url: values.wa_api_url || "https://api.fonnte.com/send",
        wa_siaga_target: values.wa_siaga_target || null,
        wa_instance_name: values.wa_instance_name || "sim-armada",
      };

      await updateMyTenantSettings(payload);

      message.success(
        "Pengaturan aplikasi & WhatsApp Gateway berhasil disimpan"
      );

      await loadSettings();
      await useTenantStore.getState().fetchTenant();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal menyimpan pengaturan aplikasi"
      );
    } finally {
      setSaving(false);
    }
  }



  const currentLogo = Form.useWatch("logo_url", form);
  const currentMedia = Form.useWatch("dashboard_image_url", form);
  const waEnabled = Form.useWatch("wa_enabled", form);
  const waProvider = Form.useWatch("wa_provider", form);

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Pengaturan Aplikasi
            </Title>

            <Text type="secondary">
              Kelola identitas, branding, dan informasi
              aplikasi
            </Text>
          </div>

          <SettingOutlined
            style={{ fontSize: 24 }}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          {/* IDENTITAS */}
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Identitas Aplikasi</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="app_name"
                  label="Nama Aplikasi"
                  rules={[
                    {
                      required: true,
                      message:
                        "Nama aplikasi wajib diisi",
                    },
                  ]}
                >
                  <Input
                    placeholder="PYROFAR"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="app_short_name"
                  label="Nama Singkat"
                  rules={[
                    {
                      required: true,
                      message:
                        "Nama singkat wajib diisi",
                    },
                  ]}
                >
                  <Input
                    placeholder="PYROFAR"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          
          {/* PROFIL SKPD */}
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Profil SKPD</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="organization_name"
                  label="Nama Organisasi / SKPD"
                >
                  <Input
                    placeholder="Dinas Pemadam Kebakaran & Penyelamatan"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="region_name"
                  label="Nama Wilayah"
                >
                  <Input
                    placeholder="Kota Makassar"
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="contact_phone"
                  label="Nomor Telepon / Darurat"
                >
                  <Input
                    placeholder="112 atau (0411) 123456"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contact_email"
                  label="Email"
                >
                  <Input
                    placeholder="damkar@makassar.go.id"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="personnel_count"
                  label="Jumlah Personil"
                >
                  <Input
                    type="number"
                    placeholder="Contoh: 150"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Alamat Markas Utama"
                >
                  <Input.TextArea
                    placeholder="Jalan ..."
                    rows={3}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Titik Koordinat (Pilih pada Peta)">
                  <LocationPicker 
                    form={form} 
                    defaultLat={form.getFieldValue("latitude")} 
                    defaultLng={form.getFieldValue("longitude")} 
                  />
                </Form.Item>
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item name="latitude" label="Latitude">
                      <Input readOnly placeholder="Pilih dari peta" />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item name="longitude" label="Longitude">
                      <Input readOnly placeholder="Pilih dari peta" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* BRANDING */}
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                <span>Branding</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Logo Aplikasi"
                  extra="PNG, JPG, atau WebP. Maksimal 5 MB. Logo akan dipotong agar tampil proporsional."
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    {currentLogo ? (
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          background: "#fafafa",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={getAssetUrl(form.getFieldValue("logo_url")) ?? undefined}
                          alt="Logo aplikasi"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            padding: 12,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          border:
                            "1px dashed #d9d9d9",
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          color: "#999",
                          textAlign: "center",
                        }}
                      >
                        Belum ada logo
                      </div>
                    )}

                    <Space>
                      <Upload
                        accept="image/png,image/jpeg,image/webp"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleLogoSelect(file);
                          return false;
                        }}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={logoUploading}
                        >
                          {currentLogo
                            ? "Ganti Logo"
                            : "Upload Logo"}
                        </Button>
                      </Upload>

                      {currentLogo && (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={
                            handleDeleteLogo
                          }
                        >
                          Hapus
                        </Button>
                      )}
                    </Space>
                  </Space>
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  name="primary_color"
                  label="Warna Utama"
                >
                  <ColorPicker
                    showText
                    format="hex"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  name="secondary_color"
                  label="Warna Sekunder"
                >
                  <ColorPicker
                    showText
                    format="hex"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>


          {/* COMMAND CENTER */}
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Command Center Dashboard</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="dashboard_video_url"
                  label="URL Video (Live Stream / YouTube)"
                  extra="Gunakan URL Embed (contoh: https://www.youtube.com/embed/...)"
                >
                  <Input
                    placeholder="https://www.youtube.com/embed/..."
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  name="dashboard_image_url"
                  label="Gambar Media (16:9)"
                  extra="Gambar pengganti video (opsional) yang akan ditampilkan di dashboard"
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {currentMedia ? (
                      <div
                        style={{
                          width: 320,
                          height: 180,
                          borderRadius: 8,
                          border: "1px solid #d9d9d9",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f0f2f5",
                        }}
                      >
                        <img
                          src={getAssetUrl(currentMedia) || ""}
                          alt="Media"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 320,
                          height: 180,
                          borderRadius: 8,
                          border: "1px dashed #d9d9d9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#999",
                          background: "#f8f9fa",
                        }}
                      >
                        Belum ada gambar
                      </div>
                    )}

                    <Space>
                      <Upload
                        accept="image/png,image/jpeg,image/webp"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleMediaSelect(file);
                          return false;
                        }}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={mediaUploading}
                        >
                          {currentMedia
                            ? "Ganti Gambar"
                            : "Upload Gambar"}
                        </Button>
                      </Upload>

                      {currentMedia && (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={
                            handleDeleteMedia
                          }
                        >
                          Hapus
                        </Button>
                      )}
                    </Space>
                  </Space>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="dashboard_running_text"
                  label="Teks Berjalan (Marquee)"
                  extra="Teks informasi yang berjalan di bawah dashboard. Pisahkan informasi dengan spasi atau karakter khusus."
                >
                  <Input.TextArea
                    placeholder="Tulis informasi di sini..."
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* INTEGRASI NOTIFIKASI WHATSAPP */}
          <Card
            title={
              <Space>
                <WhatsAppOutlined style={{ color: "#25D366", fontSize: 20 }} />
                <span style={{ fontWeight: "bold" }}>Integrasi Notifikasi WhatsApp (Siaga Damkar)</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Alert
              message="Otomatisasi Laporan Terverifikasi ke WhatsApp"
              description="Ketika operator memverifikasi laporan kebakaran atau penyelamatan, sistem akan secara otomatis mengirimkan rincian insiden dan koordinat peta Google Maps ke target grup/nomor WhatsApp yang ditentukan di bawah ini."
              type="info"
              showIcon
              icon={<WhatsAppOutlined style={{ color: "#25D366" }} />}
              style={{ marginBottom: 20 }}
            />

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="wa_enabled"
                  label="Status Notifikasi WhatsApp"
                  valuePropName="checked"
                  extra="Aktifkan / nonaktifkan pengiriman WhatsApp otomatis saat verifikasi laporan"
                >
                  <Switch checkedChildren="AKTIF" unCheckedChildren="NONAKTIF" />
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item
                  name="wa_provider"
                  label="Pilihan Gateway Provider"
                  extra="Pilih penyedia layanan gateway WhatsApp yang Anda gunakan"
                >
                  <Select size="large">
                    <Select.Option value="fonnte">
                      <Space>
                        <ApiOutlined style={{ color: "#25D366" }} />
                        <span>Fonnte (Cloud SaaS - Rekomendasi Cepat & Praktis)</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="evolution">
                      <Space>
                        <ApiOutlined style={{ color: "#1890ff" }} />
                        <span>Evolution API (Self-Hosted Docker)</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="generic">
                      <Space>
                        <ApiOutlined style={{ color: "#fa8c16" }} />
                        <span>Generic Webhook / Custom Gateway</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="wa_siaga_target"
                  label={
                    <Space>
                      <span>Target Nomor / ID Grup WhatsApp Siaga Damkar</span>
                      <Tooltip title="Untuk Fonnte, ID Grup berformat '12036301234567890@g.us'. Untuk nomor pribadi gunakan '08123456789'. Anda bisa memasukkan lebih dari satu target dengan memisahkannya menggunakan tanda koma (,).">
                        <QuestionCircleOutlined style={{ color: "#999" }} />
                      </Tooltip>
                    </Space>
                  }
                  extra="Contoh ID Grup: 120363023456789@g.us | Contoh Nomor HP: 081234567890 (Bisa多 target dipisah koma, contoh: 120363023456789@g.us, 081234567890)"
                >
                  <Input.TextArea
                    placeholder="120363023456789@g.us, 081234567890"
                    rows={2}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="wa_api_token"
                  label="API Token / Secret Key"
                  extra="Token API yang Anda dapatkan dari dashboard Fonnte (fonnte.com) atau Evolution API"
                >
                  <Input.Password
                    placeholder="Masukkan API Token..."
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="wa_api_url"
                  label="API Endpoint URL (Opsional / Default)"
                  extra="Default Fonnte: https://api.fonnte.com/send"
                >
                  <Input
                    placeholder="https://api.fonnte.com/send"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {waProvider === "evolution" && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="wa_instance_name"
                    label="Instance Name (Evolution API)"
                    extra="Nama instance di Evolution API (default: sim-armada)"
                  >
                    <Input placeholder="sim-armada" size="large" />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <Text type="secondary">
                Ingin memastikan pesan terkirim dengan benar? Tekan tombol uji coba di samping.
              </Text>

              <Button
                icon={<SendOutlined />}
                onClick={handleTestWhatsApp}
                loading={testingWA}
                style={{
                  backgroundColor: "#25D366",
                  borderColor: "#25D366",
                  color: "#fff",
                  fontWeight: "bold"
                }}
              >
                Kirim Pesan Uji Coba WhatsApp
              </Button>
            </div>
          </Card>

          <Divider />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              size="large"
            >
              Simpan Pengaturan
            </Button>
          </div>
        </Form>
      </div>

      <LogoCropModal
        open={logoCropOpen}
        image={logoPreview}
        onCancel={handleLogoCancel}
        onConfirm={handleLogoConfirm}
      />
      <MediaCropModal
        open={mediaCropOpen}
        image={mediaPreview}
        onCancel={handleMediaCancel}
        onConfirm={handleMediaConfirm}
      />
    </>
  );
}