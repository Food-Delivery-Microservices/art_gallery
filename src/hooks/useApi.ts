import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading and error states
 * @param apiFunction - The API function to call
 * @returns Object with data, loading, error, execute, and reset
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const error = err as AxiosError<{ message?: string; error?: string }>;
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An error occurred';

        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for handling API calls that execute immediately on mount
 * @param apiFunction - The API function to call
 * @param args - Arguments to pass to the API function
 * @returns Object with data, loading, error, and refetch
 */
export function useApiOnMount<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  args: any[] = []
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const error = err as AxiosError<{ message?: string; error?: string }>;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An error occurred';

      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [apiFunction, ...args]);

  // Execute on mount
  useState(() => {
    fetchData();
  });

  return {
    ...state,
    refetch: fetchData,
  };
}

// Made with Bob
