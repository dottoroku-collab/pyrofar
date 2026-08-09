import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

import AppRouter from "@/routes/AppRouter";
import { antdTheme } from "@/theme/antdTheme";

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}