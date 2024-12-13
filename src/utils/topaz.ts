import { z } from "zod";

// Environment variables validation
if (!process.env.TOPAZ_API_KEY) {
  throw new Error("TOPAZ_API_KEY must be defined in environment variables");
}

const TOPAZ_API_BASE_URL = "https://api.topazlabs.com/image/v1";

// Response schemas
const topazErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

const topazEnhanceResponseSchema = z.object({
  process_id: z.string(),
  eta: z.number(),
});

const topazStatusResponseSchema = z.object({
  process_id: z.string(),
  filename: z.string(),
  status: z.enum(["Pending", "Processing", "Completed", "Failed", "Cancelled"]),
  progress: z.number().optional(),
  result_url: z.string().optional(),
  error: z.string().optional(),
  input_format: z.string().optional(),
  input_height: z.number().optional(),
  input_width: z.number().optional(),
  output_format: z.string().optional(),
  output_height: z.number().optional(),
  output_width: z.number().optional(),
  model: z.string().optional(),
  face_enhancement: z.boolean().optional(),
  crop_to_fill: z.boolean().optional(),
  options_json: z.string().optional(),
  sync: z.boolean().optional(),
  eta: z.number().optional(),
  creation_time: z.number().optional(),
  modification_time: z.number().optional(),
  credits: z.number().optional()
});

const topazDownloadResponseSchema = z.object({
  head_url: z.string(),
  download_url: z.string(),
  expiry: z.number()
});

// Type definitions
type TopazEnhanceOptions = {
  imageUrl: string;
  outputHeight?: number;
  outputWidth?: number;
  outputFormat?: "jpg" | "png";
  faceEnhancement?: boolean;
};

type TopazEnhanceResponse = z.infer<typeof topazEnhanceResponseSchema>;
type TopazStatusResponse = z.infer<typeof topazStatusResponseSchema>;
export type TopazDownloadResponse = z.infer<typeof topazDownloadResponseSchema>;

// Helper function to handle rate limiting with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If rate limited, wait and retry
      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// Main Topaz API functions
export async function enhanceImage(
  options: TopazEnhanceOptions
): Promise<TopazEnhanceResponse> {
  // Download the image from the URL
  const imageResponse = await fetch(options.imageUrl);
  const imageBlob = await imageResponse.blob();

  // Prepare form data
  const formData = new FormData();
  formData.append("image", imageBlob);
  formData.append("model", "High Fidelity V2");

  if (options.outputHeight) {
    formData.append("output_height", options.outputHeight.toString());
  }
  if (options.outputWidth) {
    formData.append("output_width", options.outputWidth.toString());
  }
  if (options.outputFormat) {
    formData.append("output_format", options.outputFormat);
  }
  if (options.faceEnhancement !== undefined) {
    formData.append("face_enhancement", options.faceEnhancement.toString());
  }

  // Make request to Topaz API
  const response = await fetchWithRetry(
    `${TOPAZ_API_BASE_URL}/enhance/async`,
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.TOPAZ_API_KEY!,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const result = topazErrorSchema.safeParse(errorData);
    if (result.success) {
      throw new Error(`Topaz API error: ${result.data.error.message}`);
    }
    throw new Error(`Topaz API error: ${response.statusText}`);
  }

  const data = await response.json();
  const result = topazEnhanceResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid response from Topaz API");
  }

  return result.data;
}

export async function checkEnhancementStatus(
  processId: string
): Promise<TopazStatusResponse> {
  console.log(`\nChecking status for process ID: ${processId}`);
  
  const response = await fetchWithRetry(
    `${TOPAZ_API_BASE_URL}/status/${processId}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": process.env.TOPAZ_API_KEY!,
      },
    }
  );

  const responseData = await response.json();
  console.log('\nTopaz API Response:', {
    status: response.status,
    statusText: response.statusText,
    data: responseData
  });

  if (!response.ok) {
    const result = topazErrorSchema.safeParse(responseData);
    if (result.success) {
      throw new Error(`Topaz API error: ${result.data.error.message}`);
    }
    throw new Error(`Topaz API error: ${response.statusText}`);
  }

  const result = topazStatusResponseSchema.safeParse(responseData);
  if (!result.success) {
    console.error('\nZod validation errors:', result.error.format());
    throw new Error("Invalid response from Topaz API");
  }

  return result.data;
}

export async function getDownloadUrl(processId: string): Promise<{ url: string; expires_at: number }> {
  console.log(`\nGetting download URL for process ${processId}`);
  const response = await fetchWithRetry(
    `${TOPAZ_API_BASE_URL}/download/${processId}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": process.env.TOPAZ_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get download URL: ${response.statusText}`);
  }

  const responseData = await response.json();
  console.log("Download URL Response:", {
    status: response.status,
    statusText: response.statusText,
    data: responseData
  });

  const result = topazDownloadResponseSchema.safeParse(responseData);
  if (!result.success) {
    console.error('Download URL validation errors:', result.error.format());
    throw new Error("Invalid download response from Topaz API");
  }

  return {
    url: result.data.download_url,
    expires_at: result.data.expiry
  };
}

export async function downloadEnhancedImage(url: string): Promise<Blob> {
  console.log(`\nDownloading enhanced image from URL: ${url}`);
  const response = await fetchWithRetry(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to download enhanced image: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body received');
  }

  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  console.log('Download response headers:', {
    contentType,
    contentLength,
    status: response.status,
    statusText: response.statusText
  });

  const blob = await response.blob();
  console.log('Downloaded blob:', {
    size: blob.size,
    type: blob.type
  });

  return blob;
}
