import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { oklchToHex } from '@/utils/color';

interface ColorWheelProps {
  hue: number;
  lightness: number;
  chroma: number;
  onChange: (hue: number) => void;
  markers?: number[];
  size?: number;
  radius?: number;
  showCenterText?: boolean;
}

export default function ColorWheel({
  hue,
  lightness,
  chroma,
  onChange,
  markers = [],
  size = 140,
  radius = 55,
  showCenterText = true,
}: ColorWheelProps) {
  const center = size / 2;
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateHue = useCallback(
    (clientX: number, clientY: number): number | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      const dist = Math.sqrt(x * x + y * y);
      if (dist < radius - 20 || dist > radius + 20) return null;
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      return angle % 360;
    },
    [center, radius]
  );

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const newHue = calculateHue(clientX, clientY);
      if (newHue === null) return;
      onChange(newHue);
    },
    [calculateHue, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  const conicGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 360; i += 30) {
      const color = oklchToHex(lightness, chroma, i);
      stops.push(`${color} ${i}deg`);
    }
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  }, [lightness, chroma]);

  const allMarkers = useMemo(() => {
    return [hue, ...markers.filter((m) => m !== hue)];
  }, [hue, markers]);

  const mainColor = oklchToHex(lightness, chroma, hue);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      onMouseDown={handleMouseDown}
      className={cn('cursor-crosshair select-none', isDragging && 'cursor-grabbing')}
    >
      <defs>
        <mask id="wheelMask">
          <circle cx={center} cy={center} r={radius} fill="white" />
          <circle cx={center} cy={center} r={radius - 16} fill="black" />
        </mask>
      </defs>
      <foreignObject
        x={center - radius}
        y={center - radius}
        width={radius * 2}
        height={radius * 2}
        mask="url(#wheelMask)"
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: conicGradient,
          }}
        />
      </foreignObject>
      {allMarkers.map((h, i) => {
        const rad = (h - 90) * (Math.PI / 180);
        const cx = center + radius * Math.cos(rad);
        const cy = center + radius * Math.sin(rad);
        const isMain = i === 0;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={isMain ? 9 : 6}
              fill="white"
              stroke="#18181b"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
            {isMain && <circle cx={cx} cy={cy} r={4} fill={mainColor} />}
          </g>
        );
      })}
      <circle
        cx={center}
        cy={center}
        r={radius - 20}
        fill="#18181b"
        stroke="#27272a"
        strokeWidth={1}
      />
      {showCenterText && (
        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          className="fill-zinc-400 text-[11px] font-mono"
        >
          {Math.round(hue)}°
        </text>
      )}
    </svg>
  );
}
