
import React from 'react';

interface SparklineProps {
  data?: number[];
  color?: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data = [], 
  color = 'currentColor', 
  height = 30 
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const step = width / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * step;
    const y = height - ((d - min) / range) * (height * 0.8) - (height * 0.1); // Add padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
        <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="none"
            className="overflow-visible"
        >
            <polyline 
                points={points} 
                fill="none" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                vectorEffect="non-scaling-stroke"
            />
            {data.length > 0 && (
                <circle 
                    cx={width} 
                    cy={height - ((data[data.length-1] - min) / range) * (height * 0.8) - (height * 0.1)} 
                    r="3" 
                    fill={color} 
                />
            )}
        </svg>
    </div>
  );
};

export default Sparkline;
