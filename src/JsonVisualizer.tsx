import React, { useMemo } from 'react';
import { ValueRenderer } from './ValueRenderer';

interface JsonVisualizerProps {
  data: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

export const JsonVisualizer = ({ data }: JsonVisualizerProps) => {
  const content = useMemo(() => {
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-4">
          <ValueRenderer label={key} value={value as string | number | boolean | Record<string, unknown> | unknown[]} />
        </div>
      ));
    }
    return <ValueRenderer value={data} />;
  }, [data]);

  return <div className="space-y-4">{content}</div>;
};
