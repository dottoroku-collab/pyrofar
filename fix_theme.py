import re

with open("frontend/src/store/themeStore.ts", "r") as f:
    content = f.read()

# Add isSidebarHidden to ThemeState
content = content.replace("interface ThemeState {", "interface ThemeState {\n  isSidebarHidden: boolean;\n  toggleSidebarHidden: () => void;")

# Add to initial state
content = content.replace("mode: 'light',", "mode: 'light',\n      isSidebarHidden: false,")

# Add to actions
content = content.replace("toggleTheme: () =>", "toggleSidebarHidden: () =>\n        set((state) => ({ isSidebarHidden: !state.isSidebarHidden })),\n\n      toggleTheme: () =>")

with open("frontend/src/store/themeStore.ts", "w") as f:
    f.write(content)
