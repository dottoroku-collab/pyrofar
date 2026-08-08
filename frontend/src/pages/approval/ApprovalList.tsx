import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { approvalApi } from "@/api/approval";
import type { HistoriStatus } from "@/types/armada";
import { STATUS_LABEL } from "@/types/armada";

export default function ApprovalList() {
  const [data, setData] = useState<HistoriStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<HistoriStatus | null>(null);
  const [rejectForm] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await approvalApi.listPending());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(item: HistoriStatus) {
    try {
      await approvalApi.approve(item.id);
      message.success("Pengajuan disetujui");
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menyetujui pengajuan");
    }
  }

  async function handleReject(values: { catatan_approval: string }) {
    if (!rejectTarget) return;
    try {
      await approvalApi.reject(rejectTarget.id, values.catatan_approval);
      message.success("Pengajuan ditolak");
      setRejectTarget(null);
      rejectForm.resetFields();
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menolak pengajuan");
    }
  }

  return (
    <Card title="Menunggu Approval Status Kritis">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        locale={{ emptyText: "Tidak ada pengajuan yang menunggu approval" }}
        columns={[
          { title: "Armada ID", dataIndex: "armada_id" },
          {
            title: "Diajukan Status",
            dataIndex: "status_baru",
            render: (val) => <Tag color="red">{STATUS_LABEL[val as keyof typeof STATUS_LABEL]}</Tag>,
          },
          { title: "Alasan", dataIndex: "keterangan" },
          { title: "Tanggal", dataIndex: "tanggal", render: (v) => new Date(v).toLocaleString("id-ID") },
          {
            title: "Aksi",
            width: 130,
            render: (_, item) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(item)} />
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => setRejectTarget(item)} />
              </div>
            ),
          },
        ]}
      />

      <Modal
        title="Tolak Pengajuan"
        open={!!rejectTarget}
        onCancel={() => setRejectTarget(null)}
        onOk={() => rejectForm.submit()}
        okText="Tolak"
        okButtonProps={{ danger: true }}
        cancelText="Batal"
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="catatan_approval"
            label="Catatan Penolakan"
            rules={[{ required: true, message: "Catatan penolakan wajib diisi" }]}
          >
            <Input.TextArea rows={3} placeholder="Jelaskan alasan penolakan..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
