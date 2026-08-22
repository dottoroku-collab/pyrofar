import { Card, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";

export default function SaranaList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventaris = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/sarana/inventaris");
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaris();
  }, []);

  const columns = [
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
    },
    {
      title: "Kondisi",
      dataIndex: "kondisi",
      key: "kondisi",
      render: (val: string) => {
        let color = "default";
        if (val === "baik") color = "success";
        if (val === "rusak_ringan") color = "warning";
        if (val === "rusak_berat") color = "error";
        return <Tag color={color}>{val.replace("_", " ")}</Tag>;
      },
    },
  ];

  return (
    <Card title="Daftar Inventaris (Sarana & Prasarana)">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
}
