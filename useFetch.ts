import { useCallback, useEffect, useState } from 'react';

export const useFetch = (
  url: string,
  retryAmount?: number,
  retryTime: number = 1,
  exponentialBackoffMultiplier: number = 1
) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const shouldRetry = retryAmount && retryAmount > 0;

  useEffect(() => {
    const abortController = new AbortController();
    if (url) {
      fetching(url, retryTime, 0, abortController);
    }
    return () => abortController.abort();
  }, [url]);

  const fetching = useCallback(
    (url: string, retryTime: number, retries: number, abortController: AbortController) => {
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: abortController.signal,
      })
        .then((response) => {
          if (!response.ok) {
            if (shouldRetry && retryAmount > retries) {
              setTimeout(() => {
                fetching(url, retryTime * exponentialBackoffMultiplier, retries + 1, abortController);
              }, retryTime * 1000);
            }
            throw Error('could not fetch the data for that resource');
          }
          return response.json();
        })
        .then((data) => {
          setLoading(false);
          setData(data);
          setError(null);
        })
        .catch((error) => {
          setLoading(false);
          setError({ message: error.message });
        });
    },
    [url]
  );

  return { data, loading, error };
};
export default useFetch;
