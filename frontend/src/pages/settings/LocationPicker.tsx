import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { FormInstance } from "antd";

interface LocationPickerProps {
  form: FormInstance;
  defaultLat: number | null;
  defaultLng: number | null;
}

function LocationMarker({ form, defaultLat, defaultLng }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    defaultLat && defaultLng ? { lat: defaultLat, lng: defaultLng } : null
  );

  useEffect(() => {
    if (defaultLat && defaultLng) {
      setPosition({ lat: defaultLat, lng: defaultLng });
    }
  }, [defaultLat, defaultLng]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      form.setFieldsValue({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function LocationPicker({ form, defaultLat, defaultLng }: LocationPickerProps) {
  const center = defaultLat && defaultLng 
    ? { lat: defaultLat, lng: defaultLng } 
    : { lat: -5.147665, lng: 119.432731 }; // Default to Makassar

  return (
    <div style={{ height: 300, width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid #d9d9d9" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker form={form} defaultLat={defaultLat} defaultLng={defaultLng} />
      </MapContainer>
    </div>
  );
}
