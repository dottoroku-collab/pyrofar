import requests

endpoints = [
    "/api/v1/insiden/",
    "/api/v1/rescue/",
    "/api/v1/inspeksi/",
    "/api/v1/armada/",
    "/api/v1/relawan/",
    "/api/v1/tenants/me"
]

for endpoint in endpoints:
    url = f"http://localhost:8000{endpoint}"
    # Use a dummy token to see if it gives 401 or 404
    headers = {"Authorization": "Bearer dummy_token"}
    r = requests.get(url, headers=headers)
    print(f"{endpoint}: {r.status_code}")

