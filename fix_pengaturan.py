import re

with open("frontend/src/pages/settings/Pengaturan.tsx", "r") as f:
    content = f.read()

# Replace imports
content = content.replace('import { settingsApi } from "@/api/settings";', 'import { getMyTenantSettings, updateMyTenantSettings } from "@/api/tenant";')
content = content.replace('import type { AppSettings } from "@/types/settings";', 'import type { TenantSettings as AppSettings } from "@/types/tenant";')

# Replace get
content = content.replace('const data = await settingsApi.get();', 'const data = await getMyTenantSettings();')

# Replace update
content = content.replace('const current = await settingsApi.get();', 'const current = await getMyTenantSettings();')
content = content.replace('await settingsApi.update(payload);', 'await updateMyTenantSettings(payload);')

# Replace logo delete
content = content.replace('const data = await settingsApi.deleteLogo();', '// Logo deletion is not implemented on tenant settings yet')

with open("frontend/src/pages/settings/Pengaturan.tsx", "w") as f:
    f.write(content)

