'use client';

import { trpc } from '@/utils/trpc';

export default function TestPage() {
  const healthQuery = trpc.test.health.useQuery();
  const userCountQuery = trpc.test.userCount.useQuery();

  return (
    <div>
      <h1>tRPC Test Page</h1>

      <h2>Health Check</h2>
      {healthQuery.isLoading ? (
        <p>Loading...</p>
      ) : healthQuery.error ? (
        <p>Error: {healthQuery.error.message}</p>
      ) : (
        <pre>{JSON.stringify(healthQuery.data, null, 2)}</pre>
      )}

      <h2>User Count</h2>
      {userCountQuery.isLoading ? (
        <p>Loading...</p>
      ) : userCountQuery.error ? (
        <p>Error: {userCountQuery.error.message}</p>
      ) : (
        <pre>{JSON.stringify(userCountQuery.data, null, 2)}</pre>
      )}
    </div>
  );
}
