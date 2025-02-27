import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { ValueRenderer } from './ValueRenderer';
import { FixedSizeList } from 'react-window';

interface JsonVisualizerProps {
  data: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

// Lazy load the ValueRenderer component
const LazyValueRenderer = lazy(() => 
  Promise.resolve({
    default: ValueRenderer
  })
);

// A simple key-value entry component for virtualization
const Entry = ({ index, style, data }: { index: number, style: React.CSSProperties, data: [string, unknown][] }) => {
  const [key, value] = data[index];
  return (
    <div style={style} className="mb-4">
      <Suspense fallback={<div className="p-2 text-gray-400">Loading...</div>}>
        <LazyValueRenderer label={key} value={value as any} />
      </Suspense>
    </div>
  );
};

// Define the component without memo for now
export function JsonVisualizer({ data }: JsonVisualizerProps) {
  const [parsedData, setParsedData] = useState<Record<string, unknown> | unknown[] | string | number | boolean | null>(data);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof data === 'string') {
      try {
        const trimmedData = data.trim();
        setIsLoading(true);
        // Use a small timeout to prevent UI freezing during parsing
        setTimeout(() => {
          try {
            setParsedData(JSON.parse(trimmedData));
            setError(null);
          } catch (e) {
            console.error("Invalid JSON format");
            setError("Invalid Data");
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } catch {
        console.error("Invalid JSON format");
        setError("Invalid Data");
      }
    } else {
      setParsedData(data);
      setError(null);
    }
  }, [data]);

  const entries = useMemo(() => {
    if (typeof parsedData === 'object' && parsedData !== null) {
      return Object.entries(parsedData);
    }
    return [];
  }, [parsedData]);

  if (isLoading) {
    return <div className="text-gray-500 text-sm mb-1">Processing data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm mb-1">{error}</div>;
  }

  if (typeof parsedData === 'object' && parsedData !== null) {
    // Use virtualization if we have a lot of entries
    if (entries.length > 20) {
      return (
        <FixedSizeList
          height={500}
          width="100%"
          itemCount={entries.length}
          itemSize={80}
          itemData={entries}
        >
          {Entry}
        </FixedSizeList>
      );
    }
    
    // For smaller datasets, render normally
    return (
      <div>
        {entries.map(([key, value]) => (
          <div key={key} className="mb-4">
            <Suspense fallback={<div className="p-2 text-gray-400">Loading...</div>}>
              <LazyValueRenderer label={key} value={value as string | number | boolean | Record<string, unknown> | unknown[]} />
            </Suspense>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
