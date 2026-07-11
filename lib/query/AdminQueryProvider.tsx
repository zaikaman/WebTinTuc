"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only toast for background refetches that already had data;
            // first-load errors are handled by QueryErrorBanner on each page.
            if (query.state.data !== undefined) {
              const message =
                error instanceof Error ? error.message : "Lỗi tải dữ liệu admin";
              toast.error(message, { id: `rq-error-${String(query.queryKey[0])}` });
            }
          },
        }),
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
