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
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]),
  progress: z.number().optional(),
  result_url: z.string().optional(),
  error: z.string().optional(),
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
  const response = await fetchWithRetry(
    `${TOPAZ_API_BASE_URL}/status/${processId}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": process.env.TOPAZ_API_KEY!,
      },
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
  const result = topazStatusResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid response from Topaz API");
  }

  return result.data;
}

export async function downloadEnhancedImage(url: string): Promise<Blob> {
  const response = await fetchWithRetry(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to download enhanced image: ${response.statusText}`);
  }

  return await response.blob();
}
