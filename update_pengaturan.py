import re

with open("frontend/src/pages/settings/Pengaturan.tsx", "r") as f:
    content = f.read()

# Add import
import_stmt = 'import LocationPicker from "./LocationPicker";\n'
content = content.replace('import LogoCropModal from "@/components/settings/LogoCropModal";', 'import LogoCropModal from "@/components/settings/LogoCropModal";\n' + import_stmt)

# Add Bank Profil SKPD
profile_skpd_section = """
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
"""

content = content.replace("{/* BRANDING */}", profile_skpd_section + "\n          {/* BRANDING */}")

with open("frontend/src/pages/settings/Pengaturan.tsx", "w") as f:
    f.write(content)

