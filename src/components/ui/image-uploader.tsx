'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { useImageUploader } from '@/hooks/use-image-uploader';

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export function ImageUploader({ onUploadComplete, className }: ImageUploaderProps) {
  const t = useTranslations('upload.dropzone');
  const { isUploading, progress, error, uploadedUrl, uploadImage } = useImageUploader();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await uploadImage(acceptedFiles[0]);
        if (onUploadComplete) {
          onUploadComplete(uploadedUrl!);
        }
      }
    },
    [uploadImage, uploadedUrl, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <Card
      className={`relative overflow-hidden ${isDragActive ? 'border-primary' : ''} ${className}`}
    >
      <CardContent
        {...getRootProps()}
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center p-6"
      >
        <input {...getInputProps()} />

        {uploadedUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={uploadedUrl}
              alt="Uploaded preview"
              className="rounded-md object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="mb-4 h-12 w-12 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm font-medium">{t('text')}</p>
            <p className="text-xs text-muted-foreground">{t('hint')}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-[200px] space-y-2 p-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
