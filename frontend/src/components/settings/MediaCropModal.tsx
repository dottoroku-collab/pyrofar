import { useState } from "react";
import {
  Button,
  Modal,
  Slider,
  Space,
  Typography,
} from "antd";
import Cropper, {
  type Area,
} from "react-easy-crop";

interface MediaCropModalProps {
  open: boolean;
  image: string | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const { Text } = Typography;

function createCroppedImage(
  imageSrc: string,
  crop: Area
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = 1920;
      canvas.height = 1080;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(
          new Error("Canvas tidak tersedia")
        );
        return;
      }

      ctx.clearRect(0, 0, 1920, 1080);

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        1920,
        1080
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Gagal membuat gambar"
              )
            );
            return;
          }

          resolve(blob);
        },
        "image/webp",
        0.9
      );
    };

    image.onerror = () => {
      reject(
        new Error("Gagal membaca gambar")
      );
    };

    image.src = imageSrc;
  });
}

export default function MediaCropModal({
  open,
  image,
  onCancel,
  onConfirm,
}: MediaCropModalProps) {
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState<Area | null>(null);

  const [processing, setProcessing] =
    useState(false);

  async function handleConfirm() {
    if (!image || !croppedAreaPixels) {
      return;
    }

    setProcessing(true);

    try {
      const blob = await createCroppedImage(
        image,
        croppedAreaPixels
      );

      const file = new File(
        [blob],
        "media.webp",
        {
          type: "image/webp",
        }
      );

      onConfirm(file);
    } catch (error) {
      console.error(
        "Gagal crop media:",
        error
      );
    } finally {
      setProcessing(false);
    }
  }

  function handleCancel() {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);

    onCancel();
  }

  return (
    <Modal
      open={open}
      title="Sesuaikan Gambar Media (16:9)"
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnClose
    >
      {image && (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 360,
              background: "#111",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(
                _croppedArea,
                croppedPixels
              ) => {
                setCroppedAreaPixels(
                  croppedPixels
                );
              }}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <Text strong>
              Zoom
            </Text>

            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
            />
          </div>

          <Space
            style={{
              width: "100%",
              justifyContent:
                "flex-end",
              marginTop: 16,
            }}
          >
            <Button
              onClick={handleCancel}
              disabled={processing}
            >
              Batal
            </Button>

            <Button
              type="primary"
              loading={processing}
              onClick={handleConfirm}
            >
              Gunakan Gambar
            </Button>
          </Space>
        </>
      )}
    </Modal>
  );
}
