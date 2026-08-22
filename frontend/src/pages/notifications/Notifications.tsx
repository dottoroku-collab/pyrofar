import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

export default function Notifications() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>Notifications</Title>
        <p>This is a placeholder page for Notifications.</p>
      </Card>
    </div>
  );
}
