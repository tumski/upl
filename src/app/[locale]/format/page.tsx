'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function FormatPage() {
  const t = useTranslations('Format');
  const router = useRouter();
  const params = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get the most recent image URL from localStorage
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    const lastImage = uploadedImages[uploadedImages.length - 1];
    
    if (!lastImage) {
      // If no image is found, redirect back to upload
      router.push(`/${params.locale}/upload`);
      return;
    }

    setImageUrl(lastImage);
  }, [router, params]);

  if (!imageUrl) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Preview */}
        <div className="relative aspect-square w-full max-w-md mx-auto">
          <Image
            src={imageUrl}
            alt={t('previewAlt')}
            fill
            className="object-contain rounded-lg border"
          />
        </div>

        {/* Format Options - placeholder for now */}
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">{t('formatOptions')}</h2>
            <p className="text-muted-foreground">{t('comingSoon')}</p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/${params.locale}/upload`)}
            className="w-full"
          >
            {t('changeImage')}
          </Button>
        </div>
      </div>
    </div>
  );
} 