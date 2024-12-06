'use client';

import { trpc } from '@/lib/trpc/client';

export default function TestPage() {
  const healthQuery = trpc.test.health.useQuery();
  const userCountQuery = trpc.test.userCount.useQuery();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Health Check</h2>
          {healthQuery.isLoading ? (
            <p>Loading...</p>
          ) : healthQuery.error ? (
            <p className="text-red-500">Error: {healthQuery.error.message}</p>
          ) : (
            <pre>{JSON.stringify(healthQuery.data, null, 2)}</pre>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">User Count</h2>
          {userCountQuery.isLoading ? (
            <p>Loading...</p>
          ) : userCountQuery.error ? (
            <p className="text-red-500">Error: {userCountQuery.error.message}</p>
          ) : (
            <pre>{JSON.stringify(userCountQuery.data, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
