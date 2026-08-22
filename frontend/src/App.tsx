import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

import AppRouter from "@/routes/AppRouter";
import { getAntdTheme } from "@/theme/antdTheme";
import { useThemeStore } from "@/store/themeStore";

export default function App() {
  const mode = useThemeStore((s) => s.mode);

  return (
    <ConfigProvider theme={getAntdTheme(mode)}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}