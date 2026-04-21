'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
      <button onClick={() => reset()} className="rounded bg-blue-500 px-4 py-2 text-white">
        다시 시도
      </button>
    </div>
  );
}
