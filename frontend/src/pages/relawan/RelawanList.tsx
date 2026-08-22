import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Select, Space, Row, Col } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getRelawanList } from "@/api/relawan";
import { getProvinces, getRegencies, getDistricts, getVillages, Region } from "@/services/regionApi";

const { Option } = Select;

export default function RelawanList() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [filterProvinsi, setFilterProvinsi] = useState<string | undefined>();
  const [filterKota, setFilterKota] = useState<string | undefined>();
  const [filterKecamatan, setFilterKecamatan] = useState<string | undefined>();
  const [filterKelurahan, setFilterKelurahan] = useState<string | undefined>();

  useEffect(() => {
    fetchData();
    fetchProvinces();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRelawanList();
      setData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    const data = await getProvinces();
    setProvinces(data);
  };

  const handleProvinceChange = async (provName: string, option: any) => {
    setFilterProvinsi(provName);
    setFilterKota(undefined);
    setFilterKecamatan(undefined);
    setFilterKelurahan(undefined);
    setCities([]); setDistricts([]); setVillages([]);
    
    if (option?.key) {
      const data = await getRegencies(option.key);
      setCities(data);
    }
  };

  const handleCityChange = async (cityName: string, option: any) => {
    setFilterKota(cityName);
    setFilterKecamatan(undefined);
    setFilterKelurahan(undefined);
    setDistricts([]); setVillages([]);
    
    if (option?.key) {
      const data = await getDistricts(option.key);
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (districtName: string, option: any) => {
    setFilterKecamatan(districtName);
    setFilterKelurahan(undefined);
    setVillages([]);
    
    if (option?.key) {
      const data = await getVillages(option.key);
      setVillages(data);
    }
  };

  const handleVillageChange = (val: string) => {
    setFilterKelurahan(val);
  };

  const filteredData = data.filter(d => {
    let match = true;
    if (filterProvinsi && d.provinsi !== filterProvinsi) match = false;
    if (filterKota && d.kota !== filterKota) match = false;
    if (filterKecamatan && d.kecamatan !== filterKecamatan) match = false;
    if (filterKelurahan && d.kelurahan !== filterKelurahan) match = false;
    return match;
  });

  const columns = [
    { title: 'NIK', dataIndex: 'nik', key: 'nik' },
    { title: 'Nama', dataIndex: 'nama', key: 'nama' },
    { title: 'No. Telepon', dataIndex: 'no_telepon', key: 'no_telepon' },
    { 
      title: 'Wilayah', 
      key: 'wilayah',
      render: (_: any, record: any) => (
        <span>
          {record.kecamatan ? `${record.kecamatan}, ` : ''}{record.kota || '-'}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (
        <Tag color={val === 'active' ? 'green' : val === 'in_mission' ? 'orange' : 'default'}>
          {val?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/relawan/relawan/${record.id}`)}
        />
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Data Pendaftar Relawan Damkar</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/relawan/relawan/new')}>
          Form Pendaftaran Baru
        </Button>
      </div>
      
      <Card title="Filter Wilayah" size="small">
        <Row gutter={16}>
          <Col span={6}>
            <Select style={{ width: '100%' }} showSearch placeholder="Semua Provinsi" allowClear onChange={handleProvinceChange} value={filterProvinsi}>
              {provinces.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} showSearch placeholder="Semua Kota/Kabupaten" allowClear onChange={handleCityChange} value={filterKota} disabled={!filterProvinsi}>
              {cities.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} showSearch placeholder="Semua Kecamatan" allowClear onChange={handleDistrictChange} value={filterKecamatan} disabled={!filterKota}>
              {districts.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} showSearch placeholder="Semua Kelurahan" allowClear onChange={handleVillageChange} value={filterKelurahan} disabled={!filterKecamatan}>
              {villages.map(p => <Option key={p.id} value={p.name}>{p.name}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}
