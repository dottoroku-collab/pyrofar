import {
  AppstoreOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
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
  message,
} from "antd";

import {
  KeyOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { licenseApi } from "@/api/license";
import type { LicenseInfo } from "@/types/license";

import { useEffect, useState } from "react";
import { getAssetUrl } from "@/api/client";
import { settingsApi } from "@/api/settings";
import type { AppSettings } from "@/types/settings";

import LogoCropModal from "@/components/settings/LogoCropModal";

const { Title, Text } = Typography;

export default function Pengaturan() {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseActivating, setLicenseActivating] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");

  async function loadSettings() {
    setLoading(true);

    try {
      const data = await settingsApi.get();

      form.setFieldsValue({
        ...data,
        primary_color: data.primary_color || "#C62828",
        secondary_color: data.secondary_color || "#263238",
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
    loadLicense();
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
      const data = await settingsApi.uploadLogo(file);

      form.setFieldValue("logo_url", data.logo_url);

      message.success("Logo berhasil diperbarui");

      setLogoCropOpen(false);

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoPreview(null);

      await loadSettings();
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
      const data = await settingsApi.deleteLogo();

      form.setFieldValue("logo_url", data.logo_url);

      message.success("Logo berhasil dihapus");

      await loadSettings();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal menghapus logo"
      );
    }
  }

  async function handleSubmit(values: AppSettings) {
    setSaving(true);

    try {
      const payload = {
        app_name: values.app_name,
        app_short_name: values.app_short_name,
        organization_name:
          values.organization_name || null,
        region_name:
          values.region_name || null,
        logo_url:
          values.logo_url || null,
        primary_color:
          values.primary_color || "#C62828",
        secondary_color:
          values.secondary_color || "#263238",
        contact_email:
          values.contact_email || null,
        contact_phone:
          values.contact_phone || null,
        address:
          values.address || null,
      };

      await settingsApi.update(payload);

      message.success(
        "Pengaturan aplikasi berhasil disimpan"
      );

      await loadSettings();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ??
          "Gagal menyimpan pengaturan aplikasi"
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadLicense() {
  setLicenseLoading(true);

  try {
    const data = await licenseApi.get();

    setLicense(data.license);
  } catch (err: any) {
    message.error(
      err?.response?.data?.detail ??
        "Gagal memuat informasi lisensi"
    );
  } finally {
    setLicenseLoading(false);
  }
}

async function handleActivateLicense() {
  const key = licenseKey.trim();

  if (!key) {
    message.warning("Masukkan kode lisensi terlebih dahulu");
    return;
  }

  setLicenseActivating(true);

  try {
    const data = await licenseApi.activate({
      license_key: key,
    });

    setLicense(data.license);
    setLicenseKey("");

    message.success("Lisensi berhasil diaktifkan");
  } catch (err: any) {
    message.error(
      err?.response?.data?.detail ??
        "Gagal mengaktifkan lisensi"
    );
  } finally {
    setLicenseActivating(false);
  }
}

  const currentLogo = form.getFieldValue("logo_url");

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
                    placeholder="SIM Armada Damkar"
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
                    placeholder="SIM Armada"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="organization_name"
                  label="Nama Organisasi"
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
                  label="Wilayah"
                >
                  <Input
                    placeholder="Kota Makassar"
                    size="large"
                  />
                </Form.Item>
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

          {/* KONTAK */}
          <Card
            title={
              <Space>
                <MailOutlined />
                <span>Informasi Kontak</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contact_email"
                  label="Email"
                  rules={[
                    {
                      type: "email",
                      message:
                        "Format email tidak valid",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="damkar@makassarkota.go.id"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="contact_phone"
                  label="Nomor Telepon"
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0411-xxxxxxx"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Alamat"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Alamat kantor..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
  title={
    <Space>
      <SafetyCertificateOutlined />
      <span>Lisensi Aplikasi</span>
    </Space>
  }
  style={{ marginBottom: 16 }}
  loading={licenseLoading}
>
  {!license ? (
    <div>
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%" }}
      >
        <div>
          <Text strong>Lisensi belum diaktifkan</Text>

          <br />

          <Text type="secondary">
            Masukkan kode lisensi yang diberikan oleh
            administrator sistem untuk mengaktifkan
            paket dan fitur aplikasi.
          </Text>
        </div>

        <Input
          size="large"
          prefix={<KeyOutlined />}
          placeholder="Masukkan kode lisensi"
          value={licenseKey}
          onChange={(e) =>
            setLicenseKey(e.target.value)
          }
          onPressEnter={handleActivateLicense}
        />

        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          loading={licenseActivating}
          onClick={handleActivateLicense}
        >
          Aktifkan Lisensi
        </Button>
      </Space>
    </div>
  ) : (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <div>
        <Text type="secondary">
          Paket Lisensi
        </Text>

        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {license.plan_name}
        </div>

        <Text type="secondary">
          {license.plan_code}
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small">
            <Text type="secondary">
              Organisasi
            </Text>

            <div style={{ fontWeight: 500 }}>
              {license.organization_name || "-"}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small">
            <Text type="secondary">
              Berlaku Sampai
            </Text>

            <div style={{ fontWeight: 500 }}>
              {new Date(
                license.expires_at
              ).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small">
            <Text type="secondary">
              Maksimal Pengguna
            </Text>

            <div style={{ fontWeight: 500 }}>
              {license.max_users ?? "Tidak terbatas"}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small">
            <Text type="secondary">
              Maksimal Armada
            </Text>

            <div style={{ fontWeight: 500 }}>
              {license.max_armada ?? "Tidak terbatas"}
            </div>
          </Card>
        </Col>
      </Row>

      <div>
        <Text strong>Fitur yang tersedia</Text>

        <div style={{ marginTop: 12 }}>
          <Space wrap>
            {license.features.length > 0 ? (
              license.features.map((feature) => (
                <span
                  key={feature}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ marginRight: 6 }}
                  />

                  {feature}
                </span>
              ))
            ) : (
              <Text type="secondary">
                Tidak ada fitur khusus.
              </Text>
            )}
          </Space>
        </div>
      </div>
    </Space>
  )}
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
    </>
  );
}