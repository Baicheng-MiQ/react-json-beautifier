import React, { useState, useEffect } from 'react';
import { ValueRenderer } from './ValueRenderer';

interface JsonVisualizerProps {
  data: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

export const JsonVisualizer = ({ data }: JsonVisualizerProps) => {
  const [parsedData, setParsedData] = useState<Record<string, unknown> | unknown[] | string | number | boolean | null>(data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof data === 'string') {
      try {
        const trimmedData = data.trim();
        setParsedData(JSON.parse(trimmedData));
        setError(null);
      } catch {
        console.error("Invalid JSON format");
        setError("Invalid Data");
      }
    } else {
      setParsedData(data);
      setError(null);
    }
  }, [data]);

  if (error) {
    return <div className="text-red-500 text-sm mb-1">{error}</div>;
  }

  if (typeof parsedData === 'object' && parsedData !== null) {
    return (
      <div>
        {Object.entries(parsedData).map(([key, value]) => (
          <div key={key} className="mb-4">
            <ValueRenderer label={key} value={value as string | number | boolean | Record<string, unknown> | unknown[]} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
