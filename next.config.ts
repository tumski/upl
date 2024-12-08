import createNextIntlPlugin from "next-intl/plugin";
import { type NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withNextIntl(config);
