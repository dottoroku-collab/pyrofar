import re

with open("frontend/src/pages/settings/Pengaturan.tsx", "r") as f:
    content = f.read()

payload_replacement = """      const payload = {
        ...current,
        app_name: values.app_name,
        app_short_name: values.app_short_name,
        logo_url: values.logo_url || null,
        primary_color: values.primary_color || "#C62828",
        secondary_color: values.secondary_color || "#263238",
        organization_name: values.organization_name || null,
        region_name: values.region_name || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        personnel_count: values.personnel_count || null,
        address: values.address || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
      };"""

content = re.sub(
    r'const payload = {[\s\S]*?};',
    payload_replacement,
    content,
    flags=re.MULTILINE
)

with open("frontend/src/pages/settings/Pengaturan.tsx", "w") as f:
    f.write(content)

