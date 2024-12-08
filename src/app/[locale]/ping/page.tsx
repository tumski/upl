'use client';

import { trpc } from "@/utils/trpc";

export default function PingPage() {
  const { data, isLoading } = trpc.ping.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Ping Test</h1>
      <p>Response: {data}</p>
    </div>
  );
} 