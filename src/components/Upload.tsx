"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

type ErrorType = "fileType" | "fileSize" | "generic" | null;
type UploadStatus = "idle" | "uploading" | "success" | "error";

export function Upload() {
  const t = useTranslations("Upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<ErrorType>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Clear any previous errors and reset status
    setError(null);
    setUploadStatus("idle");

    // Handle rejected files first
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setError("fileSize");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setError("fileType");
      } else {
        setError("generic");
      }
      return;
    }

    // Handle accepted file
    const file = acceptedFiles[0];
    if (file) {
      // Clean up previous preview if it exists
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Create preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Start upload process
      setUploadStatus("uploading");
      
      try {
        // TODO: Implement actual file upload to Vercel Blob
        // Simulating upload delay for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        setUploadStatus("success");
      } catch (err) {
        setUploadStatus("error");
        setError("generic");
        // Clean up preview on error
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
      }
    }
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
    disabled: uploadStatus === "uploading"
  });

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {preview ? (
        <div className="mb-4 relative w-full aspect-square max-w-md mx-auto">
          <Image
            src={preview}
            alt="Preview"
            fill
            className={cn(
              "object-contain rounded-lg transition-opacity duration-200",
              uploadStatus === "uploading" && "opacity-50"
            )}
          />
          {uploadStatus === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 p-3 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium">
                {t("uploadingStatus")}
              </div>
            </div>
          )}
          {uploadStatus === "success" && (
            <div className="absolute top-2 right-2 bg-background/80 p-2 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="absolute top-2 right-2 bg-background/80 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
          {uploadStatus !== "uploading" && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                URL.revokeObjectURL(preview);
                setPreview(null);
                setUploadStatus("idle");
                setError(null);
              }}
            >
              {t("changeImage")}
            </Button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:bg-muted/50",
            isDragActive ? "border-primary bg-muted/50" : error ? "border-destructive" : "border-muted-foreground/25",
            uploadStatus === "uploading" && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {error ? (
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          ) : (
            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          )}
          <div className="mt-4 text-lg font-medium">
            {error ? t(`errors.${error}`) : t("dragDropTitle")}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {error ? null : t("dragDropDescription")}
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" disabled={uploadStatus === "uploading"}>
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