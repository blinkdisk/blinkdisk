import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RenderOptions, render } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
}

export function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

export function renderWithQueryClient(
  ui: ReactElement,
  queryClient?: QueryClient,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const client = queryClient || createTestQueryClient();
  return {
    ...render(ui, {
      wrapper: createWrapper(client),
      ...options,
    }),
    queryClient: client,
  };
}