import { useState, useEffect } from 'react';

export function useFetchBusinessTypes(token: string | null, isVisible: boolean) {
  const [businessTypes, setBusinessTypes] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      if (!isVisible || !token) {
        console.log("Skipping fetch: isVisible=", isVisible, "token=", token);
        setBusinessTypes([]);
        return;
      }

      setLoading(true);
      setError(null);
      console.log("Fetching business types with token:", token);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/types/business?isActive=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log("Business types response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          throw new Error(errorData.message || 'Failed to fetch business types.');
        }

        const data = await response.json();
        console.log("Business types response data:", data);
        const typeList = Array.isArray(data.types)
          ? data.types.map((type: { name: string }) => ({ name: type.name }))
          : [];
        setBusinessTypes(typeList);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching business types.';
        console.error("Fetch error:", errorMessage);
        setError(errorMessage);
        setBusinessTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessTypes();
  }, [token, isVisible]);

  return { businessTypes, loading, error };
}