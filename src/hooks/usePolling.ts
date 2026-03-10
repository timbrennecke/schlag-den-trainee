"use client";

import { useState, useEffect, useCallback } from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number
): { data: T | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);

  const refetch = useCallback(() => {
    fetcher().then(setData);
  }, [fetcher]);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, intervalMs);
    return () => clearInterval(id);
  }, [refetch, intervalMs]);

  return { data, refetch };
}
