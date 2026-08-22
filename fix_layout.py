import re

with open("frontend/src/components/layout/MainLayout.tsx", "r") as f:
    content = f.read()

# Add useThemeStore import if not there
if "import { useThemeStore" not in content:
    content = content.replace('import { useTokens } from "@/store/themeStore";', 'import { useTokens, useThemeStore } from "@/store/themeStore";')

# Add isSidebarHidden to layout component
if "const isSidebarHidden = useThemeStore" not in content:
    content = content.replace('const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);', 'const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);\n  const { isSidebarHidden } = useThemeStore();')

# Update layout to conditionally render Sider
if "isSidebarHidden" in content:
    # We want to completely hide Sider if isSidebarHidden is true
    sider_block = """      ) : (
        <Sider width={260} style={{
          background: tokens.sidebarBg,
          borderRight: `1px solid ${tokens.sidebarBorder}`,
          boxShadow: "1px 0 10px rgba(0,0,0,0.05)",
          zIndex: 10
        }}>
          <Sidebar />
        </Sider>
      )}"""
    
    new_sider_block = """      ) : !isSidebarHidden ? (
        <Sider width={260} style={{
          background: tokens.sidebarBg,
          borderRight: `1px solid ${tokens.sidebarBorder}`,
          boxShadow: "1px 0 10px rgba(0,0,0,0.05)",
          zIndex: 10
        }}>
          <Sidebar />
        </Sider>
      ) : null}"""
    content = content.replace(sider_block, new_sider_block)

with open("frontend/src/components/layout/MainLayout.tsx", "w") as f:
    f.write(content)
