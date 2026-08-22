import re

with open("frontend/src/components/layout/Topbar.tsx", "r") as f:
    content = f.read()

# Add MenuFoldOutlined, MenuUnfoldOutlined to imports
content = content.replace("MenuOutlined }", "MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined }")

# Add isSidebarHidden and toggleSidebarHidden
content = content.replace("const { mode, toggleTheme } = useThemeStore();", "const { mode, toggleTheme, isSidebarHidden, toggleSidebarHidden } = useThemeStore();")

# Add toggle button in the left part of Topbar
left_part = "        <div style={{ display: \"flex\", alignItems: \"center\", gap: isMobile ? 8 : 16 }}>\n"
new_left_part = """        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          {!isMobile && (
            <Button 
              type="text" 
              icon={isSidebarHidden ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={toggleSidebarHidden} 
              style={{ color: tokens.textSecondary, fontSize: '16px' }}
            />
          )}
"""
content = content.replace(left_part, new_left_part)

with open("frontend/src/components/layout/Topbar.tsx", "w") as f:
    f.write(content)
