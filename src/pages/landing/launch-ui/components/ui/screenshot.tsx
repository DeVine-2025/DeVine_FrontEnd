interface ScreenshotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export default function Screenshot({ src, alt, width, height, loading, className }: ScreenshotProps) {
  return <img src={src} alt={alt} width={width} height={height} loading={loading} className={className ? `block ${className}` : "block"} />;
}
