'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FormatForm from './_components/FormatForm';

export default function FormatPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get the most recent image URL and format settings from localStorage
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    const lastImage = uploadedImages[uploadedImages.length - 1];
    const savedFormat = JSON.parse(localStorage.getItem('formatSettings') || '{}');
    
    if (!lastImage) {
      // If no image is found, redirect back to upload
      router.push(`/${params.locale}/upload`);
      return;
    }

    setImageUrl(lastImage);
  }, [router, params.locale]);

  if (!imageUrl) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <FormatForm
      imageUrl={imageUrl}
      initialValues={JSON.parse(localStorage.getItem('formatSettings') || '{}')}
      onBack={() => router.push(`/${params.locale}/upload`)}
      mode="create"
    />
  );
}
