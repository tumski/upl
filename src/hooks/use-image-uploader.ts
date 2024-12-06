'use client';

import { useState } from 'react';
import { useToast } from './use-toast';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

export interface ImageValidation {
  maxSizeInMB: number;
  acceptedTypes: string[];
}

const defaultValidation: ImageValidation = {
  maxSizeInMB: 20,
  acceptedTypes: ['image/jpeg', 'image/png'],
};

export function useImageUploader(validation: ImageValidation = defaultValidation) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
  });

  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!validation.acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPG or PNG file.';
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > validation.maxSizeInMB) {
      return `File is too large. Maximum size is ${validation.maxSizeInMB}MB.`;
    }

    return null;
  };

  const uploadImage = async (file: File): Promise<void> => {
    const error = validateFile(file);
    if (error) {
      setState(prev => ({ ...prev, error }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our tRPC endpoint which will handle Vercel Blob upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedUrl: url,
      }));

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to upload image';
      setState(prev => ({
        ...prev,
        isUploading: false,
        error,
        progress: 0,
      }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
    });
  };

  return {
    ...state,
    uploadImage,
    reset,
  };
}
