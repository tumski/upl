'use client';

import { trpc } from '@/utils/trpc';
import { Suspense } from 'react';

function HealthCheck() {
  const healthQuery = trpc.test.health.useQuery();

  if (healthQuery.error) {
    return <p className="text-red-500">Error: {healthQuery.error.message}</p>;
  }

  return <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(healthQuery.data, null, 2)}</pre>;
}

function UserCount() {
  const userCountQuery = trpc.test.userCount.useQuery();

  if (userCountQuery.error) {
    return <p className="text-red-500">Error: {userCountQuery.error.message}</p>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded">
      <p className="text-lg font-semibold">Total Users</p>
      <p className="text-3xl font-bold mt-2">
        {userCountQuery.data?.count.toLocaleString() ?? '—'}
      </p>
    </div>
  );
}

function LoadingFallback() {
  return <p className="text-gray-500">Loading...</p>;
}

export default function TestPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Health Check</h2>
          <Suspense fallback={<LoadingFallback />}>
            <HealthCheck />
          </Suspense>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">User Count</h2>
          <Suspense fallback={<LoadingFallback />}>
            <UserCount />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
