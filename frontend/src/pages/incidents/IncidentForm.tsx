import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

export default function IncidentForm() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>Incident Form</Title>
        <p>This is a placeholder for creating or editing an incident.</p>
      </Card>
    </div>
  );
}
