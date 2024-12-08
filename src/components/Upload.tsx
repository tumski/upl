"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";
import Image from "next/image";

export function Upload() {
  const t = useTranslations("Upload");
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false
  });

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {preview ? (
        <div className="mb-4 relative w-full aspect-square max-w-md mx-auto">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain rounded-lg"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              URL.revokeObjectURL(preview);
              setPreview(null);
            }}
          >
            {t("changeImage")}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:bg-muted/50",
            isDragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"
          )}
        >
          <input {...getInputProps()} />
          <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-4 text-lg font-medium">{t("dragDropTitle")}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t("dragDropDescription")}
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm">
              {t("selectFileButton")}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t("fileRequirements")}
          </div>
        </div>
      )}
    </div>
  );
} 