// sol-frontend/app/lib/hooks/useFuzzy.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EmotionalData {
  estadoEmocional: number;
  generoPreferido: string;
}

export function useFuzzy() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const analyze = async (data: EmotionalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/emotional/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (responseData.success) {
        setResult(responseData.data);
        return responseData.data;
      } else {
        throw new Error(responseData.message);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, result, error };
}